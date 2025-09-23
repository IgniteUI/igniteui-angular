import { spawn } from 'child_process';
import fs from "fs";
import path from "path";

main().catch((err) => {
    console.error(err);
    process.exit(1);
})

async function main() {
    const allFiles = getAllSpecFiles("projects/igniteui-angular/src/lib");

    const sentinelArg = process.argv[2];
    const mode = process.argv[3] || "before";
    const skipInitial = process.argv.includes("--skip-initial");

    if (!sentinelArg) {
        console.error("Usage: node test-polluter-bisect.js <sentinel-file.spec.ts> [before|all]");
        process.exit(1);
    }

    const sentinelFile = allFiles.find(f => f.includes(sentinelArg));

    if (!sentinelFile) {
        console.error(`Sentinel file '${sentinelArg}' not found in the test set.`);
        process.exit(1);
    }

    console.log(`Running polluter search with sentinel: ${sentinelArg}, mode: ${mode}`);
    const culprit = await findPolluter(allFiles, sentinelFile, mode, !skipInitial);

    if (culprit) {
        console.log(`Polluter file is: ${culprit}`);
    } else {
        console.log("No polluter found in the set.");
    }
}

async function findPolluter(allFiles, sentinelFile, mode = "before", doInitialScan = true) {
    let suspects;
    
    if (mode === "before") {
        suspects = allFiles.slice(0, allFiles.indexOf(sentinelFile));
    } else if (mode === "all") {
        suspects = allFiles.filter(f => f !== sentinelFile);
    } else {
        throw new Error(`Unknown mode: ${mode}`);
    }

    if (doInitialScan) {
        console.log("Initial run with full set...");
        const initialPass = await runTests([...suspects, sentinelFile], sentinelFile);

        if (initialPass) {
            console.log("Sentinel passed even after full set — no polluter detected.");
            return null;
        }
    } else {
        console.log("Skipping initial full-set scan.");
    }
    
    while (suspects.length > 1) {
        const mid = Math.floor(suspects.length / 2);
        const left = suspects.slice(0, mid);
        const right = suspects.slice(mid);

        if (await runTests([...left, sentinelFile], sentinelFile)) {
            suspects = right;
        } else {
            suspects = left;
        }
    }
    return suspects[0];
}

function runTests(files, sentinelFile) {
    return new Promise((resolve) => {
        const sentinelNorm = normalizeForNg(sentinelFile);
        const runnerFile = createPolluterRunner(files);

        const args = [
            "test",
            "igniteui-angular",
            "--watch=false",
            "--browsers=ChromeHeadlessNoSandbox",
            "--include",
            runnerFile
        ];

        let output = "";
        const proc = spawn("npx", ["ng", ...args], { shell: true });

        proc.stdout.on("data", (data) => {
            const text = data.toString();
            output += text;
            process.stdout.write(text);
        });
        proc.stderr.on("data", (data) => {
            const text = data.toString();
            output += text;
            process.stdout.write(text);
        });

        proc.on("exit", () => {
            const sentinelFailed = path.basename(sentinelNorm);
            const failed = output.includes("FAILED") && output.includes(sentinelFailed);
            console.log(`Sentinel ${sentinelFailed} ${failed ? "FAILED" : "PASSED"}`);
            resolve(!failed);
        });
    })
}

function getAllSpecFiles(dir) {
    let files = [];
    fs.readdirSync(dir).forEach((file) => {
        const full = path.join(dir, file);
        if (fs.statSync(full).isDirectory()) {
            files = files.concat(getAllSpecFiles(full));
        } else if (file.endsWith(".spec.ts")) {
            files.push(full);
        }
    });
    return files.sort();
}

function normalizeForNg(file) {
    const rel = path.relative(process.cwd(), file);
    return rel.split(path.sep).join("/");
}

function createPolluterRunner(files) {
    const imports = files.map(f =>
        `require('${normalizeForNg(f).replace(/\.ts$/, "")}');`
    ).join("\n");

    const runnerPath = path.join(process.cwd(), "projects/igniteui-angular/src/polluter-runner.spec.ts");
    fs.mkdirSync(path.dirname(runnerPath), { recursive: true});
    fs.writeFileSync(runnerPath, imports, "utf8");
    return runnerPath;
}