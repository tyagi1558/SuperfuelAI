import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function getsnippets() {
  const res = await pool.query("SELECT * FROM snippets");
  return res.rows;
}

export async function getsnippetsById(id) {
  const res = await pool.query("SELECT * FROM snippets WHERE id = $1", [id]);
  return res.rows[0];
}

export async function createCodeSnippet({ name, code }) {
  await pool.query("INSERT INTO snippets (name, code) VALUES ($1, $2)", [
    name,
    code,
  ]);
}

export async function deleteCodeSnippet(id) {
  try {
    const result = await pool.query(
      "DELETE FROM snippets WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return { success: false, message: "Snippet not found" };
    }
    console.log("result.rows[0]:", result.rows[0]);
    return {
      success: true,
      message: "Snippet deleted successfully",
      deletedSnippet: result.rows[0],
    };
  } catch (error) {
    console.error("Error deleting code snippet:", error);
    return {
      success: false,
      message: "Failed to delete snippet",
      error: error.message,
    };
  }
}

export async function RunCodeSnippetById(id) {
  try {
    const result = await pool.query("SELECT code FROM snippets WHERE id = $1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return { error: "Snippet not found" };
    }

    const codeToRun = result.rows[0].code;
    const { output, logs } = await executeCode(codeToRun);

    return { output, logs };
  } catch (error) {
    console.error("Error running code:", error);
    return { error: error.message };
  }
}

async function executeCode(code) {
  let logs = [];

  try {
    const originalConsole = console;

    global.console = {
      log: (...args) => {
        const logMessage = args
          .map((arg) =>
            typeof arg === "object" ? JSON.stringify(arg) : String(arg)
          )
          .join(" ");
        logs.push(logMessage);
        originalConsole.log(...args);
      },
      error: (...args) => {
        const logMessage = args
          .map((arg) =>
            typeof arg === "object" ? JSON.stringify(arg) : String(arg)
          )
          .join(" ");
        logs.push(`ERROR: ${logMessage}`);
        originalConsole.error(...args);
      },
      warn: (...args) => {
        const logMessage = args
          .map((arg) =>
            typeof arg === "object" ? JSON.stringify(arg) : String(arg)
          )
          .join(" ");
        logs.push(`WARNING: ${logMessage}`);
        originalConsole.warn(...args);
      },
      info: (...args) => {
        const logMessage = args
          .map((arg) =>
            typeof arg === "object" ? JSON.stringify(arg) : String(arg)
          )
          .join(" ");
        logs.push(`INFO: ${logMessage}`);
        originalConsole.info(...args);
      },
    };

    const wrappedCode = `
      let __result;
      try {
        ${code}
        return __result;
      } catch (e) {
        console.error("Code execution error:", e.message);
        throw e;
      }
    `;

    const result = await new Function(
      `return (async () => { ${wrappedCode} })()`
    )();

    global.console = originalConsole;

    return {
      output: result,
      logs: logs,
    };
  } catch (error) {
    if (global.console !== console) {
      global.console = console;
    }

    console.error("Code execution failed:", error);
    return {
      output: undefined,
      logs: [...logs, `EXECUTION ERROR: ${error.message}`],
      error: error.message,
    };
  }
}
