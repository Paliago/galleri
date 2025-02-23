/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "galleri",
      removal: input?.stage === "prod" ? "retain" : "remove",
      protect: ["prod"].includes(input?.stage),
      home: "aws",
    };
  },
  async run() {
    $transform(sst.aws.Function, (args) => {
      args.runtime ??= "nodejs22.x";
      args.architecture ??= "arm64";
    });

    await import("./infra/storage");
    await import("./infra/api");
    await import("./infra/web");

    // Makes it easier to find the resources in the console
    new aws.resourcegroups.Group("Group", {
      name: `${$app.stage}-${$app.name}`,
      resourceQuery: {
        query: JSON.stringify({
          ResourceTypeFilters: ["AWS::AllSupported"],
          TagFilters: [
            {
              Key: "sst:app",
              Values: [`${$app.name}`],
            },
            {
              Key: "sst:stage",
              Values: [`${$app.stage}`],
            },
          ],
        }),
      },
      tags: {
        "sst:app": `${$app.name}`,
        "sst:stage": `${$app.stage}`,
      },
    });

  },
});
