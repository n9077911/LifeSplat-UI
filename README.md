# LifeSplat-UI

A web site that projects a British persons financial future including projecting their savings and earliest feasible retirement date. 
Projections are based on the users key financial details and assumptions.

The site is backed by [LifeSplat-Service](https://github.com/n9077911/LifeSplat-Service)
 for more details see the [README.md](https://github.com/n9077911/LifeSplat-Service/blob/master/README.md)

LifeSplat-UI's responsibilities are to accept inputs from the user and render a visualisation of the retirement report produced by LifeSplat-Service.

## Tech Stack
LifeSplat-UI is a Single Page App written javascript using [React](https://reactjs.org/). 

Charts are produced using [ChartJS](https://www.chartjs.org/) and [chartjs-annotation-plugin](https://github.com/chartjs/chartjs-plugin-annotation)

## To-do Items

* Support for users to edit the assumptions.
* Support 25% tax free lump sum
* Support life time contribution limit for private pensions.
* Support for Buy to Let and other investment types.
* Support for defined benefit pension (not sure how - possibly via a generic 'Other income Streams')
* Permitting stepped income - i.e. some users expect their income to change over time.
* Recommendations - given the users status advise them on what to do e.g. what happens if you put more in your pension? vs put more in your ISA?
* Student loans
* Scottish tax system

The potential future features are extensive, above is just an example

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!


## Running in a local server
Ensure http-server is installed 'npm install --global http-server'
From the project directory run `http-server build` 
This runs the build directory at localhost:8080


## Contributing

Currently LifeSplat-UI does not accept contributions. If there is demand this can change.

## License

License details can be found in [LICENSE.html](./LICENSE.html)