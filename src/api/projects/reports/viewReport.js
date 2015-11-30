import db from '../../../database';
import serverName from '../../serverName';

export default (req, res, next) => {
  const projectId = req.params.projectId;

  db.queryAsync('SELECT data, frequency, type FROM evaluations WHERE projectid = $1', [projectId])
  .then(({rows}) => {
    const typeToPercentageList = {};
    rows.forEach((row) => {
      let yes = 0, no = 0;
      if (typeof row.data == 'string') {
        row.data = JSON.parse(row.data);
      }

      Object.keys(row.data).forEach((key) => {
        const answers = row.data[key];
        answers.forEach((answer) => {
          if (answer.answer === 0) yes++;
          else if (answer.answer === 1) no++;
        });
      });

      if (yes + no > 0) {
        typeToPercentageList[row.type] = typeToPercentageList[row.type] || [];
        typeToPercentageList[row.type].push({ percentage: yes / (yes + no), frequency: row.frequency });
      }
    });

    let totalSum = 0, typeCount = 0;

    Object.keys(typeToPercentageList).forEach((key) => {
      const percentages = typeToPercentageList[key];
      let sum = 0, count = 0;

      percentages.forEach((percentage) => {
        count += percentage.frequency;
        sum += percentage.percentage * percentage.frequency;
      });

      totalSum += sum / count;
      typeCount++;
    });

    const result = typeCount ? totalSum / typeCount : null;

    res.json({
      _rels:{
        self: `${serverName.api}projects/${projectId}/report`
      },
      accessibility: result
    });
  });
};