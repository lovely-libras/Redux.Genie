// code to generate a rails style structure

const fs = require('fs');
const action_boiler_Rails_model = require('./action_boiler_Rails_model');
const actionTypes_boiler = require('./constants_boiler');
const reducer_creator = require('./reducer_creator');
const combine_reducers = require('./combine_reducers_boiler');
const store_reducer = require('./store_boiler');
const chalk = require('chalk');
const thunks_Rails_model = require('./thunks_Rails_model');

if (process.env.mode === 'testing') {
  console.log = () => {};
}

module.exports = (Models, Thunks, Logging, Update) => {
  let modelNames = Models.map(
    Model =>
      (Model = Object.keys(Model)[0][0]
        .toUpperCase()
        .concat(Object.keys(Model)[0].slice(1)))
  );

  let crudedModelNames = Models.filter(model => !(model.CRUD === false));

  let userDefinedActions = Models.filter(model => model.Actions);

  try {
    // heres the action creator file:
    // if actions declared separate on yaml
    // added action names to the action constants to be created
    // if no crud, delete crud from action call

    if (!Update) {
      fs.writeFile(
        `./store/constants/action_constants.js`,
        actionTypes_boiler(crudedModelNames, userDefinedActions),
        () => {
          console.log(
            chalk.green(
              `Successfully generated action constants for ${chalk.white(
                `${modelNames}`
              )}!`
            )
          );
        }
      );
    }

    // create action types
    // same scenario gamed out like constants re: CRUD
    // and declared actions

    Models.forEach(async model => {
      let modelName = Object.keys(model)[0][0]
        .toUpperCase()
        .concat(Object.keys(model)[0].slice(1));

      fs.writeFile(`./store/actions/selectors_for_${modelName}.js`, '', () => {
        console.log(
          chalk.green(
            `Successfully generated selectors for ${chalk.white(
              `${modelName}`
            )}!`
          )
        );
      });

      fs.writeFile(
        `./store/actions/actions_for_${modelName}.js`,
        action_boiler_Rails_model(modelName, model, Thunks),
        () => {
          console.log(
            chalk.green(
              `Successfully generated action types for ${chalk.white(
                `${modelName}`
              )}!`
            )
          );
        }
      );

      if (!Thunks && model.Thunks) {
        fs.writeFile(
          `./store/actions/thunks_for_${modelName}.js`,
          thunks_Rails_model(modelName, model, Thunks),
          () => {
            console.log(
              chalk.green(
                `Successfully generated thunks for ${chalk.white(
                  `${modelName}`
                )}!`
              )
            );
          }
        );
      }
    });

    // create combine_reducers.js file

    if (!Update) {
      fs.writeFile(
        './store/reducers/combine_reducers.js',
        combine_reducers(modelNames),
        () => {
          console.log(
            chalk.green(
              `Successfully generated action constants for ${chalk.white(
                `${'combine_reducers.js'}`
              )}!`
            )
          );
        }
      );
    }

    // create store.js file
    if (!Update) {
      fs.writeFile('./store/store.js', store_reducer(Logging), () => {
        console.log(
          chalk.green(
            `Successfully generated action constants for ${chalk.white(
              `${'store_reducer.js'}`
            )}!`
          )
        );
      });
    }
    // create reducer for each model

    Models.forEach(async model => {
      let modelName = Object.keys(model)[0][0]
        .toUpperCase()
        .concat(Object.keys(model)[0].slice(1));

      fs.writeFile(
        `./store/reducers/reducer_for_${modelName}.js`,
        reducer_creator(model, modelName),
        () => {
          console.log(
            chalk.green(
              `Successfully generated reducers for ${chalk.white(
                `${modelName}`
              )}!`
            )
          );
        }
      );
    });
  } catch (err) {
    console.error(err);
  }
};
