import { exec } from "child_process";
import { copy } from "fs-extra";
import { copyFile, rm, writeFile } from "fs/promises";
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
  name: "Minimal Theme for Twitter / X",
  short_name: "Minimal Twitter",
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
    default_title: "Minimal Twitter",
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
    default_title: "Minimal Twitter",
    default_popup: "index.html",
  },
};

const bundle = async (manifest, bundleDirectory) => {
  try {
    // Remove old bundle directory
    await rm(bundleDirectory, { recursive: true, force: true }); // requires node 14+
    console.log(`🧹  Cleaned up \`${bundleDirectory}\` directory.`);

    // Run both build scripts
    const runBuildScript = (directory) => {
      return new Promise(async (resolve, reject) => {
        const intervalId = startSpinner("Building popup and content scripts...");

        try {
          await runCommand(`cd ./${directory} && yarn && yarn build`);
          stopSpinner(intervalId);
          resolve();
        } catch (error) {
          stopSpinner(intervalId);
          console.error(
            `Error running build script for ${directory}: ${error}`
          );
          reject(error);
        }
      });
    };

    await runBuildScript("popup");
    await runBuildScript("content-scripts");

    stopSpinner(null);
    console.log("🔥  Built popup and content scripts.");

    // Bundle popup Next.js export
    await copy("popup/out", `${bundleDirectory}`);
    console.log(`🚗  Moved export to bundle.`);

    // Bundle content-scripts
    await copy("content-scripts/dist", `${bundleDirectory}/dist`);
    console.log(`🚗  Moved content_scripts to bundle.`);

    // Bundle background.js
    await copyFile("background.js", `${bundleDirectory}/background.js`);
    console.log(`🚗  Moved background.js to bundle.`);

    // Bundle css
    await copy("css", `${bundleDirectory}/css`);
    console.log(`🚗  Moved css to bundle.`);

    // Bundle fonts
    await copy("fonts", `${bundleDirectory}/fonts`);
    console.log(`🚗  Moved fonts to bundle.`);

    // Bundle images
    await copy("images", `${bundleDirectory}/images`);
    console.log(`🚗  Moved images to bundle.`);

    // Create manifest
    await writeFile(
      `${bundleDirectory}/manifest.json`,
      Buffer.from(JSON.stringify(manifest, null, 2)),
      "utf8"
    );

    // Done.
    console.log(`📦  Bundled \`${bundleDirectory}\`.`);

    // Zip the directory
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
  } catch (error) {
    console.error(error);
  }
};

const bundleAll = async () => {
  await bundle(MANIFEST_CHROME, "bundle/chrome");
  await bundle(MANIFEST_FIREFOX, "bundle/firefox");
};

const generateSafariProjectCommand = `xcrun safari-web-extension-converter bundle/firefox --project-location bundle/safari --app-name 'Minimal Twitter' --bundle-identifier 'com.typefully.minimal-twitter'`;

// The first command currently ignores the full --bundle-identifier flag (it still take the company name), so a replace is required to make sure it matches our bundle identifier
const fixBundleIdentifierCommand = `find "bundle/safari/Minimal Twitter" \\( -name "*.swift" -or -name "*.pbxproj" \\) -type f -exec sed -i '' 's/com.typefully.Minimal-Twitter/com.typefully.minimal-twitter/g' {} +`;

const bundleSafari = async () => {
  await bundle(MANIFEST_FIREFOX, "bundle/firefox");

  const intervalId = startSpinner("Bundling Safari...");

  await runCommand(generateSafariProjectCommand, true);
  await runCommand(fixBundleIdentifierCommand, true);

  stopSpinner(intervalId);
};

const normalizeBundleTarget = (value) => value?.trim().toLowerCase();

const runBundleTarget = async (target) => {
  switch (normalizeBundleTarget(target)) {
    case "chrome":
      await bundle(MANIFEST_CHROME, "bundle/chrome");
      return true;

    case "firefox":
      await bundle(MANIFEST_FIREFOX, "bundle/firefox");
      return true;

    case "safari":
      await bundleSafari();
      return true;

    case "all":
      await bundleAll();
      return true;

    default:
      return false;
  }
};

const promptForBundleTarget = () => {
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

const main = async () => {
  const cliTarget = process.argv[2];

  if (cliTarget) {
    const handled = await runBundleTarget(cliTarget);

    if (!handled) {
      console.error(
        `Unknown bundle target \`${cliTarget}\`. Use one of: all, chrome, firefox, safari.`
      );
      process.exit(1);
    }

    process.exit(0);
  }

  const promptTarget = await promptForBundleTarget();
  const handled = await runBundleTarget(promptTarget);

  if (!handled) {
    await bundleAll();
  }
};

await main();

/*--- Bundle without prompting
await bundleAll();
process.exit(0);
---*/
