const TITLE = process.env.PR_TITLE ?? "";
const BODY = process.env.PR_BODY ?? "";
const HEADINGS = [
  "Purpose",
  "Rule IDs",
  "Test evidence",
  "Look images",
  "Performance impact",
  "Documentation and release",
];
const ERRORS: string[] = [];
if (
  !/^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-z0-9-]+\))?!?: .+/.test(
    TITLE,
  )
) {
  ERRORS.push("GIT-01: use a Conventional Commit PR title.");
}
for (const heading of HEADINGS) {
  if (!BODY.includes(`## ${heading}`))
    ERRORS.push(`GIT-03: include the ${heading} field from the PR template.`);
}
if (!/^Agent-authored: (yes|no)\s*$/m.test(BODY)) {
  ERRORS.push("GIT-06: set Agent-authored: yes or Agent-authored: no explicitly.");
}
if (ERRORS.length) {
  console.error(
    "HATTAT_E903: PR metadata is incomplete. Update the PR title/body using the template.\n" +
      ERRORS.join("\n"),
  );
  process.exitCode = 1;
} else {
  console.log(
    "PASS: Conventional Commit title, PR evidence headings, and explicit agent authorship.",
  );
}
