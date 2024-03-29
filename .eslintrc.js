module.exports = {
  "env":{
    "browser":true,
    "es2021":true
  },
  "extends":[
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "prettier"
  ],
  "parser":"@typescript-eslint/parser",
  "parserOptions":{
    "ecmaFeatures":{
      "jsx":true
    },
    "ecmaVersion":"latest",
    "sourceType":"module"
  },
  "plugins":[
    "@typescript-eslint",
    "react",
    "simple-import-sort",
    "unused-imports",
    "no-relative-import-paths",
    "mui-path-imports"
  ],
  "rules":{
    "react/prop-types":"off",
    "react/react-in-jsx-scope":"off",
    "simple-import-sort/imports":"error",
    "unused-imports/no-unused-imports":"error",
    "no-relative-import-paths/no-relative-import-paths": [
      "warn",
      { "allowSameFolder": true, "rootDir": "packages/react-app/src" }
    ],
    "@typescript-eslint/no-explicit-any":"off",
    "@typescript-eslint/no-non-null-assertion":"off",
    "@typescript-eslint/ban-ts-comment":"off",
    "@typescript-eslint/no-unused-vars":[
      "error",
      {
        "argsIgnorePattern":"^_$",
        "varsIgnorePattern":"^_$",
        "caughtErrorsIgnorePattern":"^_$"
      }
    ],
    "mui-path-imports/mui-path-imports": "error"
  },
  "settings":{
    "react":{
      "version":"detect"
    }
  }
}