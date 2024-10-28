# print-diff-tree
Print old and new file tree from output of git diff --name-status

## Prerequisites

- [Deno](https://deno.com/)

## Usage

```
git diff --name-status origin/main...HEAD | deno run https://github.com/kotakato/print-diff-tree/raw/refs/heads/main/print-diff-tree.ts
```

### Options

- `--include-modified-files`: Include modified files in the output. Modified files are not included by default in order to keep the output simple.
- `--print-status`: Print status of each file.
