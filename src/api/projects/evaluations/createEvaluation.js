import R from 'ramda';
import db from '../../../database';
import validations from '../../../utils/validations';
import schema from './schema.json';

export default (req, res, next) => {
  const projectId = req.params.id;

  const { result, name } = req.body;
  const type = validations.isNumber(req.body.type) ? req.body.type : parseInt(req.body.type, 10);

  if (!validations.name(name) || !validations.isNumberInRange(0, R.toPairs(schema).length, type)) {
    return next([400, 'Invalid evaluation data.']);
  }

  db.begin().then((transaction) => {
    transaction.queryAsync(`
      SELECT SUM(projectsCount) FROM 
        ((SELECT COUNT(*) as projectsCount FROM Projects WHERE ownerId = 5 AND id = 9)
          UNION
        (SELECT COUNT(*) as projectsCount FROM Collaborators WHERE userId = 5 AND projectId = 9)) as projectsCounts`)
    .then(({rows}) => {
      if (rows[0].sum == '0') {
        return next([404, 'Project not found']);
      }

      return transaction.queryAsync(`INSERT INTO Evaluations (data, projectId, name, type) VALUES ($1, $2, $3, $4);`, [result, projectId, name, type])
    }).then(() => transaction.commitAsync())
    .then(() => {
      res.status(204).send();
    });
  });
}