import db from '../../database';
import validations from '../../utils/validations';

export default (req, res, next) => {
  const { projectName } = req.body;

  console.log(projectName);
  if (!validations.projectName(projectName)) {
    return next([400, 'Invalid project name.']);
  }

  db.begin()
  .then((transaction) =>
    transaction.queryAsync('SELECT COUNT(*) FROM Projects WHERE name = $1;', [projectName])
    .then(({rows}) => {
      if (rows[0].count != '0') {
        return next([409, 'A project with that name already exists.']);
      }

      return transaction.queryAsync('INSERT INTO Projects (name, ownerId) VALUES ($1, $2);', [projectName, req.user.id])
      .then(() => transaction.commitAsync())
      .then(() => res.end())
    })
  );
};