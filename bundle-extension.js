import { exec } from "child_process";
import { copy } from "fs-extra";
import { copyFile, readFile, rm, writeFile } from "fs/promises";
import process from "process";
import readline from "readline";
import zipper from "zip-local";

const runCommand = (command, yes) =>
  new Promise((resolve, reject) => {
    exec(yes ? `echo "y" | ${command}` : command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });

const canRenderSpinner =
  typeof process.stdout.clearLine === "function" &&
  typeof process.stdout.cursorTo === "function";

const startSpinner = (message) => {
  if (!canRenderSpinner) {
    console.log(message);
    return null;
  }

  let spinner = "\\";
  const frames = ["\\", "|", "/", "-"];

  return setInterval(() => {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    spinner = frames[frames.indexOf(spinner) + 1] || frames[0];
    process.stdout.write(`${spinner}   ${message}`);
  }, 250);
};

const stopSpinner = (intervalId) => {
  if (intervalId) {
    clearInterval(intervalId);
  }

  if (canRenderSpinner) {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
  }
};

let manifest = {
  name: "More Minimal Theme for Twitter / X",
  short_name: "More Minimal Twitter",
  description: "Refine and declutter the 𝕏/Twitter web experience.",
  version: "6.4.1",
  icons: {
    16: "images/MinimalTwitterIcon16.png",
    32: "images/MinimalTwitterIcon32.png",
    48: "images/MinimalTwitterIcon48.png",
    128: "images/MinimalTwitterIcon128.png",
  },
  permissions: ["storage"],
  options_ui: {
    page: "index.html",
    open_in_tab: true,
  },
};

const MANIFEST_CHROME = {
  ...manifest,
  manifest_version: 3,
  background: {
    service_worker: "background.js",
    type: "module",
  },
  content_scripts: [
    {
      run_at: "document_end",
      matches: [
        "https://twitter.com/*",
        "https://mobile.twitter.com/*",
        "https://x.com/*",
      ],
      js: ["dist/main.js"],
    },
  ],
  web_accessible_resources: [
    {
      resources: [
        "css/main.css",
        "fonts/inter-subset.woff2",
      ],
      matches: [
        "https://twitter.com/*",
        "https://mobile.twitter.com/*",
        "https://x.com/*",
      ],
    },
  ],
  action: {
    default_icon: {
      16: "images/MinimalTwitterIcon16.png",
      32: "images/MinimalTwitterIcon32.png",
      48: "images/MinimalTwitterIcon48.png",
    },
    default_title: "More Minimal Twitter",
    default_popup: "index.html",
  },
};

const MANIFEST_FIREFOX = {
  ...manifest,
  manifest_version: 2,
  browser_specific_settings: {
    gecko: {
      id: "{e7476172-097c-4b77-b56e-f56a894adca9}",
    },
  },
  background: {
    scripts: ["background.js"],
    persistent: false,
  },
  content_scripts: [
    {
      run_at: "document_idle",
      matches: [
        "https://twitter.com/*",
        "https://mobile.twitter.com/*",
        "https://x.com/*",
      ],
      js: ["dist/main.js"],
    },
  ],
  web_accessible_resources: [
    "css/main.css",
    "fonts/inter-subset.woff2",
  ],
  browser_action: {
    default_icon: {
      16: "images/MinimalTwitterIcon16.png",
      32: "images/MinimalTwitterIcon32.png",
      48: "images/MinimalTwitterIcon48.png",
    },
    default_title: "More Minimal Twitter",
    default_popup: "index.html",
  },
};

const runBuildScript = async (directory) => {
  const intervalId = startSpinner("Building popup and content scripts...");

  try {
    await runCommand(`cd ./${directory} && yarn && yarn build`);
  } catch (error) {
    console.error(`Error running build script for ${directory}: ${error}`);
    throw error;
  } finally {
    stopSpinner(intervalId);
  }
};

const bundle = async (manifest, bundleDirectory) => {
  await rm(bundleDirectory, { recursive: true, force: true });
  console.log(`🧹  Cleaned up \`${bundleDirectory}\` directory.`);

  await runBuildScript("popup");
  await runBuildScript("content-scripts");

  console.log("🔥  Built popup and content scripts.");

  await copy("popup/out", `${bundleDirectory}`);
  console.log("🚗  Moved export to bundle.");

  await copy("content-scripts/dist", `${bundleDirectory}/dist`);
  console.log("🚗  Moved content_scripts to bundle.");

  await copyFile("background.js", `${bundleDirectory}/background.js`);
  console.log("🚗  Moved background.js to bundle.");

  await copy("css", `${bundleDirectory}/css`);
  console.log("🚗  Moved css to bundle.");

  await copy("fonts", `${bundleDirectory}/fonts`);
  console.log("🚗  Moved fonts to bundle.");

  await copy("images", `${bundleDirectory}/images`);
  console.log("🚗  Moved images to bundle.");

  await writeFile(
    `${bundleDirectory}/manifest.json`,
    Buffer.from(JSON.stringify(manifest, null, 2)),
    "utf8"
  );

  console.log(`📦  Bundled \`${bundleDirectory}\`.`);

  zipper.sync
    .zip(`./${bundleDirectory}`)
    .compress()
    .save(`./bundle/${bundleDirectory.replace("bundle/", "")}.zip`);

  console.log(
    `🧬  Zipped \`${bundleDirectory}\` to \`bundle/${bundleDirectory.replace(
      "bundle/",
      ""
    )}.zip\`.`
  );
};

const bundleAll = async () => {
  await bundle(MANIFEST_CHROME, "bundle/chrome");
  await bundle(MANIFEST_FIREFOX, "bundle/firefox");
};

const generateSafariProjectCommand = `xcrun safari-web-extension-converter bundle/firefox --project-location bundle/safari --app-name 'More Minimal Twitter' --bundle-identifier 'com.typefully.minimal-twitter'`;

// The first command currently ignores the full --bundle-identifier flag (it still take the company name), so a replace is required to make sure it matches our bundle identifier
const fixBundleIdentifierCommand = `find "bundle/safari/More Minimal Twitter" \\( -name "*.swift" -or -name "*.pbxproj" \\) -type f -exec sed -i '' 's/com.typefully.Minimal-Twitter/com.typefully.minimal-twitter/g' {} +`;
const SAFARI_VERSION_FILE = "./safari-version.json";
const SAFARI_PROJECT_FILE = "./bundle/safari/More Minimal Twitter/More Minimal Twitter.xcodeproj/project.pbxproj";

const applySafariProjectVersioning = async () => {
  const content = await readFile(SAFARI_VERSION_FILE, "utf8");
  const { buildNumber } = JSON.parse(content);

  if (!Number.isInteger(buildNumber) || buildNumber < 1) {
    throw new Error("Invalid Safari build number in safari-version.json");
  }

  const projectContent = await readFile(SAFARI_PROJECT_FILE, "utf8");
  const updatedProjectContent = projectContent
    .replace(
      /MARKETING_VERSION = [\d.]+;/g,
      `MARKETING_VERSION = ${manifest.version};`
    )
    .replace(
      /CURRENT_PROJECT_VERSION = \d+;/g,
      `CURRENT_PROJECT_VERSION = ${buildNumber};`
    );

  await writeFile(SAFARI_PROJECT_FILE, updatedProjectContent, "utf8");
};

const bundleSafari = async () => {
  await bundle(MANIFEST_FIREFOX, "bundle/firefox");

  const intervalId = startSpinner("Bundling Safari...");

  try {
    await runCommand(generateSafariProjectCommand, true);
    await runCommand(fixBundleIdentifierCommand, true);
    await applySafariProjectVersioning();
  } finally {
    stopSpinner(intervalId);
  }
};

const bundleActions = {
  all: bundleAll,
  chrome: async () => bundle(MANIFEST_CHROME, "bundle/chrome"),
  firefox: async () => bundle(MANIFEST_FIREFOX, "bundle/firefox"),
  safari: bundleSafari,
};

const promptForBrowser = async () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      "Which browser would you like to bundle for? [All / Chrome / Firefox / Safari] ",
      (browser) => {
        rl.close();
        resolve(browser);
      }
    );
  });
};

const normalizeBrowserTarget = (browser) => browser?.trim().toLowerCase();

const run = async () => {
  const browserArg = normalizeBrowserTarget(process.argv[2]);

  if (browserArg) {
    const bundleAction = bundleActions[browserArg];

    if (!bundleAction) {
      throw new Error(
        `Unknown bundle target \`${process.argv[2]}\`. Use one of: all, chrome, firefox, safari.`
      );
    }

    await bundleAction();
    return;
  }

  const browser = normalizeBrowserTarget(await promptForBrowser());
  const bundleAction = bundleActions[browser] || bundleActions.all;

  await bundleAction();
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

/*--- Bundle without prompting
await bundleAll();
process.exit(0);
---*/
