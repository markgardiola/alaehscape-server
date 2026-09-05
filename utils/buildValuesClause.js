/**
 * MySQL's `mysql` package let you do:
 *   db.query('INSERT INTO t (a, b) VALUES ?', [[[1, 2], [3, 4]]])
 * and it would build the multi-row VALUES clause for you. Postgres has
 * no equivalent shorthand, so this builds an equivalent parameterized
 * multi-row INSERT manually:
 *
 *   const { placeholders, values } = buildValuesClause([[1, 2], [3, 4]]);
 *   // placeholders === "($1, $2), ($3, $4)"
 *   // values       === [1, 2, 3, 4]
 *   await db.query(`INSERT INTO t (a, b) VALUES ${placeholders}`, values);
 */
function buildValuesClause(rows) {
  const values = [];
  const placeholders = rows
    .map((row) => {
      const rowPlaceholders = row.map((val) => {
        values.push(val);
        return `$${values.length}`;
      });
      return `(${rowPlaceholders.join(", ")})`;
    })
    .join(", ");

  return { placeholders, values };
}

module.exports = { buildValuesClause };
