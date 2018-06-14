### Running the Application

1. Install [Node.js](http://nodejs.org)

2. Install the Angular CLI globally:

    `npm install -g @angular/cli`

3. Run `npm install` to install app dependencies

4. Run `npm serve --open` to start the server. It will automatically open your browser at http://localhost:4200

#### Notes
1. In its current form the data is dumped in tabular form. There is no code to pause the inflow, so the browser will get overloaded and eventually crash.

2. My end goal is to summarize the data on certain attributes (language, date range) and use that to present charts/graphs to the user. This is not done yet. 

3. I see some bad JSON (busted data) coming in. It has to be handled.

4. Regex search for Tweet text and Date Range searches are not functional.


### How I envision to present the data
1. Let's say when a user searches for terms "narcos" or "narcos|sucks" we could present the data in charts/graphs that display 
- Counts by language if language selection is "All"
- Counts by verified tweets if verified selection is "All"
- Counts by days
- Data broken down by hours of day
- Further drill-downs on presented data 

### Other data points that will help users
1. Having a zip code could help to know where certain tweets originating from
