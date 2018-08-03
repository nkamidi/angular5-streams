### Running the Application

1. Install [Node.js](http://nodejs.org)

2. Install the Angular CLI globally:

    `npm install -g @angular/cli`

3. Run `npm install` to install app dependencies

4. Run `npm serve --open` to start the server. It will automatically open your browser at http://localhost:4200

#### Notes
1. The application will automatically open http://localhost:4200/mockup, which will show some charts that could be built based on the test data.

2. Please visit http://localhost:4200/main to access the functional view. This allows the user to start the data stream, pause it, and also view a graph with live data. 

3. Bad JSON (busted data) is not handled.

4. Regex search for Tweet text and Date Range searches are not functional.

5. There seems to be several ways to save the browser from being overloaded, namely buffer, throttle and sample.

### How I envision to present the data
1. Let's say when a user searches for terms "narcos" or "narcos|sucks" we could present the data in charts/graphs that display 
- Counts by language if language selection is "All"
- Counts by verified tweets if verified selection is "All"
- Counts by days
- Data broken down by hours of day
- Further drill-downs on presented data 

### Other data points that will help users
1. Having a zip code could help to know where certain tweets originating from
