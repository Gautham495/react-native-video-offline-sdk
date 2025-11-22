const {
  withAppBuildGradle,
  createRunOncePlugin,
} = require("@expo/config-plugins");

const PACKAGE_NAME = "@TheWidlarzGroup/react-native-video-stream-downloader";

function addDependency(buildGradle) {
  const dependencyLine = `    implementation fileTree(dir: "../../node_modules/${PACKAGE_NAME}/native-libs", include: ["*.aar"])`;

  if (!buildGradle.includes(dependencyLine)) {
    return buildGradle.replace(
      /dependencies\s*{/,
      match => `${match}\n${dependencyLine}`
    );
  }

  return buildGradle;
}

const withVideoStreamDownloader = config => {
  return withAppBuildGradle(config, config => {
    if (config.modResults.language !== "groovy") {
      throw new Error("withVideoStreamDownloader: app/build.gradle is not Groovy");
    }

    config.modResults.contents = addDependency(config.modResults.contents);
    return config;
  });
};

module.exports = createRunOncePlugin(
  withVideoStreamDownloader,
  "withVideoStreamDownloader",
  "1.0.0"
);
