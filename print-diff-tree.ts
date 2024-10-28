import { TextLineStream } from "jsr:@std/streams";

type FileTree = { [key: string]: FileTree };

async function main(args: string[]) {
  const includeModifiedFiles = args.includes("--include-modified-files");
  const printStatus = args.includes("--print-status");

  const lineStream = Deno.stdin.readable
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream());

  const oldFilePaths: string[] = [];
  const newFilePaths: string[] = [];

  for await (const line of lineStream) {
    const [status, path, newPath] = line.split("\t"); // Note: newPath is possibly undefined
    const suffix = printStatus ? ` [${status[0]}]` : "";

    if (status === "A") {
      // Added files are included in the new tree
      newFilePaths.push(path + suffix);
    } else if (status === "D") {
      // Deleted files are included in the old tree
      oldFilePaths.push(path + suffix);
    } else if (status.startsWith("R")) {
      // Renamed files are included in both the old and new trees
      oldFilePaths.push(path + suffix);
      newFilePaths.push(newPath + suffix);
    } else if (status === "M") {
      if (includeModifiedFiles) {
        // Modified files are included in both the old and new trees only if the flag is set in order to simplify the output
        oldFilePaths.push(path + suffix);
        newFilePaths.push(path + suffix);
      }
    }
  }

  const oldTree = buildTree(oldFilePaths);
  const newTree = buildTree(newFilePaths);

  console.log("Old File Tree:");
  printTree(oldTree);

  console.log("\nNew File Tree:");
  printTree(newTree);
}

function buildTree(filePaths: string[]): FileTree {
  const tree: FileTree = {};
  for (const filePath of filePaths) {
    const parts = filePath.trim().split("/");
    let current = tree;
    for (const part of parts) {
      if (!current[part]) current[part] = {};
      current = current[part];
    }
  }
  return tree;
}

function printTree(tree: FileTree, indent = "") {
  const entries = Object.entries(tree);
  entries.forEach(([key, value], index) => {
    const isLast = index === entries.length - 1;
    console.log(`${indent}${isLast ? "└── " : "├── "}${key}`);
    if (Object.keys(value).length > 0) {
      printTree(value, indent + (isLast ? "    " : "│   "));
    }
  });
}

await main(Deno.args);
