var plan = require('flightplan');
var environments = require('./src/environments');

for (environment in environments) {
  if (environments.hasOwnProperty(environment)) {
    var env = environments[environment];
    plan.target(environment, {
      host: env.host,
      username: env.username,
      password: env.password,
      agent: process.env.SSH_AUTH_SOCK
    });
  }
}

var updateApt = function (transport) {
  transport.sudo('apt-get update');
}

var installDB = function (transport) {
  transport.sudo('sudo apt-get install -y postgresql postgresql-contrib');
  transport.sudo('mkdir -p /var/log/postgres');
  transport.sudo('touch /var/log/postgres/logfile.txt');
  transport.sudo('echo \'/usr/local/pgsql/bin/pg_ctl start -l /home/azureuser/postgres/logfile.txt -D /usr/local/pgsql/data\' >> /etc/rc.local');
  transport.exec('sudo -u postgres psql -c "ALTER USER postgres PASSWORD \'postgres\';"');
  transport.exec('sudo -u postgres psql -c "CREATE DATABASE accesibilidad;"');
};

plan.remote('setup-dev-env', function (transport) {
  updateApt(transport);
  installDB(transport);

  // allow remote access to db
  // port 5432 should be open
  transport.exec('sudo -u postgres sed -i -e "s/#listen_addresses = \'localhost\'/listen_addresses = \'*\'/g" /etc/postgresql/$(psql -V | cut -d" " -f3 | cut -d"." -f-2)/main/postgresql.conf');
  transport.exec('echo \'host all all 0.0.0.0/0 trust\' | sudo -u postgres tee -a /etc/postgresql/$(psql -V | cut -d" " -f3 | cut -d"." -f-2)/main/pg_hba.conf');
  transport.sudo('/etc/init.d/postgresql restart');
  transport.log('Don\'t forget to open port 5432');
});

plan.remote('setup-prod-env', function (transport) {
  updateApt(transport);
  installDB(transport);

  transport.exec('echo "export NODE_ENV=production" >> ~/.profile');

  transport.sudo('apt-get install -y build-essential libssl-dev nginx');
  transport.sudo('mkdir -p /data/www');

  // node server
  // port 3000 should be open
  transport.exec('wget https://iojs.org/dist/v3.3.0/iojs-v3.3.0-linux-x64.tar.gz');
  transport.exec('tar zxf iojs-v3.3.0-linux-x64.tar.gz');
  transport.exec('rm iojs-v3.3.0-linux-x64.tar.gz');
  transport.sudo('cp /home/azureuser/iojs-v3.3.0-linux-x64/bin/* /usr/bin');
  transport.exec('rm -rf iojs-v3.3.0-linux-x64');
  transport.sudo('mkdir -p /home/node/api/');
  transport.sudo('apt-get install -y npm');
  transport.sudo('npm install forever -g');
  transport.sudo('npm install -g npm@latest');
  transport.sudo('npm cache clean -f');
  transport.sudo('npm i -g n');
  transport.sudo('n stable');
  transport.log('Don\'t forget to open port 3000');
});

var tmpDir = 'deploy-' + new Date().getTime();

plan.local('deploy', function (local) {
  var buildFiles = local.exec('(find build package.json -type f)', { silent: true });
  local.transfer(buildFiles, '/tmp/' + tmpDir);
});

plan.remote('deploy', function (transport) {
  transport.sudo('rm -rf /home/node/api');
  transport.sudo('mkdir /home/node/api');
  transport.sudo('cp -R /tmp/' + tmpDir + '/build/* /home/node/api');
  transport.sudo('cp /tmp/' + tmpDir + '/package.json /home/node/api');
  transport.sudo('find /data/www -type f -exec sed -i "s/{{API_LOCATION}}/http:\\\/\\\/' + plan.runtime.hosts[0].host + ':3000/g" {} +');
  transport.exec('cd /home/node/api && NODE_ENV=production sudo -E npm install');
  transport.sudo('pkill forever || true');
  transport.sudo('pkill node || true');
  transport.exec('sudo -E NODE_ENV=production /home/node/api/node_modules/.bin/forever start -a --uid "api" /home/node/api/server.js');
});
