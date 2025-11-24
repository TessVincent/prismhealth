import * as fs from "fs";
import * as path from "path";

const FORBIDDEN_PATTERNS = [
  /getServerSideProps/,
  /getStaticProps/,
  /getInitialProps/,
  /server-only/,
  /next\/headers/,
  /cookies\(\)/,
  /route\.ts$/,
  /route\.js$/,
  /api\/route/,
  /pages\/api/,
  /app\/api/,
  /dynamic\s*=\s*['"]force-dynamic['"]/,
];

const REQUIRES_GENERATE_STATIC_PARAMS = /\[.*\]/;

let hasErrors = false;

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const relativePath = path.relative(process.cwd(), filePath);

  FORBIDDEN_PATTERNS.forEach((pattern) => {
    if (pattern.test(content)) {
      console.error(`❌ ${relativePath}: Contains forbidden pattern: ${pattern}`);
      hasErrors = true;
    }
  });

  // Check for dynamic routes without generateStaticParams
  const dirName = path.dirname(filePath);
  const dirNameMatch = REQUIRES_GENERATE_STATIC_PARAMS.test(dirName);
  if (dirNameMatch && path.basename(filePath) === "page.tsx") {
    if (!content.includes("generateStaticParams")) {
      console.error(`❌ ${relativePath}: Dynamic route without generateStaticParams`);
      hasErrors = true;
    }
  }
}

function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and .next
      if (file !== "node_modules" && file !== ".next" && file !== "out") {
        walkDir(filePath, fileList);
      }
    } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

console.log("🔍 Checking for static export violations...\n");

const appDir = path.join(process.cwd(), "app");
if (fs.existsSync(appDir)) {
  const files = walkDir(appDir);
  files.forEach(checkFile);
}

if (hasErrors) {
  console.error("\n❌ Static export check failed!");
  process.exit(1);
} else {
  console.log("✅ Static export check passed!");
}


