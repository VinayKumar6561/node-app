const ALLOWED_PROJECTS = new Set(["Marketing", "Customer Svc", "Financial"]);


app.post("/tasks/upload", async (req, res) => {
  const connection = await db.getConnection();

  try {
    const filePath = path.join(__dirname, "../uploads/tasks_data.xlsx");

    const workbook = XLSX.readFile(filePath, { cellDates: true });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    let successCount = 0;
    let failureCount = 0;

    const successBulk = [];
    const failureBulk = [];

    const formatDate = (value) => {
      if (!value) return null;
      const d = value instanceof Date ? value : new Date(value);
      if (isNaN(d.getTime())) return null;
      return d.toISOString().split("T")[0];
    };

    const parseNumber = (value) => {
      const n = Number(value);
      return Number.isFinite(n) ? n : NaN;
    };

    // 1. VALIDATE + CLASSIFY IN MEMORY
    for (const row of rows) {
      const project = row["Project Name"];
      const task = row["Task Name"];
      const assigned = row["Assigned to"];

      const days = parseNumber(row["Days Required"]);
      const progress = parseNumber(row["Progress Percent"]);

      const start = formatDate(row["Start Date"]);
      const end = formatDate(row["End Date"]);

      let errors = [];

      if (!project) errors.push("Project Name missing");
      if (!task) errors.push("Task Name missing");
      if (!assigned) errors.push("Assigned To missing");
      if (Number.isNaN(days)) errors.push("Invalid Days Required");
      if (Number.isNaN(progress)) errors.push("Invalid Progress Percent");
      if (!start || !end) errors.push("Invalid Dates");

      if (project && !ALLOWED_PROJECTS.has(project)) {
        errors.push(
          `Unauthorized Project: '${project}'. Allowed: ${Array.from(ALLOWED_PROJECTS).join(", ")}.`,
        );
      }
      if (errors.length === 0) {
        successBulk.push([project, task, assigned, start, days, end, progress]);
      } else {
        failureBulk.push([
          String(project || ""),
          String(task || ""),
          String(assigned || ""),
          String(row["Start Date"] || ""),
          String(row["Days Required"] || ""),
          String(row["End Date"] || ""),
          String(row["Progress Percent"] || ""),
          errors.join(" | "),
        ]);
      }
    }

    // 2. BULK INSERT (FAST - only 2 queries total)
    if (successBulk.length > 0) {
      await connection.query(
        `INSERT INTO project_tasks
        (project_name, task_name, assigned_to, start_date, days_required, end_date, progress_percentage)
        VALUES ?`,
        [successBulk],
      );

      successCount = successBulk.length;
    }

    if (failureBulk.length > 0) {
      await connection.query(
        `INSERT INTO failed_project_tasks
        (raw_project_name, raw_task_name, raw_assigned_to, raw_start_date, raw_days_required, raw_end_date, raw_progress_percentage, error_message)
        VALUES ?`,
        [failureBulk],
      );

      failureCount = failureBulk.length;
    }

    res.json({
      success: true,
      total: rows.length,
      inserted: successCount,
      failed: failureCount,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  } finally {
    connection.release();
  }
});