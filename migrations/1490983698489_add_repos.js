exports.up = function (pgm) {
  pgm.createTable("github_repos", {
    id: 'id',
    installations_id: { type: "int" },
    full_name: { type: "string" },
    rules: { type: "json" },
  })

  pgm.addColumns("installations", {
    rules: { type: "json" },
  })
}
