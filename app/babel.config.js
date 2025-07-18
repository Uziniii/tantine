module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo', 
    ],
    plugins: [
      ["transform-inline-environment-variables", {
        "include": [
          "IP"
        ]
      }],
      "react-native-reanimated/plugin",
    ]
  };
};
