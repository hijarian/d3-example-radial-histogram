# d3js Radial Histogram

This is an example of displaying radial chart using [d3.js](https://d3js.org/) for the data in the following format:

```json
[
    {
        title: "Творчество",
        level: 2
    },
    {
        title: "Профессионализм",
        level: 5
    },
    {
        title: "Контакты",
        level: 2
    }
]
```

Title is being displayed outside its respective sector of the radial chart.
Level affects the outside radius of the respective sector of the radial chart.
All sectors have identical angles.
So this chart is not a pie chart, but something called in one source an ["Aster Plot"](http://bl.ocks.org/bbest/2de0e25d4840c68f2db1).

This is not a fully generic charting solution, but just an example.
The logic for placing the titles is hardwired to exactly 8 sectors.
Also, top level is 10 and all sectors are scaled the same way (0-10).

Some onhover effects were added because it's always cool to have onhover animated effects.

It is a personal project to visualise the result of a psychological exercise called ["wheel of life"](https://www.mindtools.com/pages/article/newHTE_93.htm) using d3.js.

I am very pleased in what can be accomplished with d3.js, this is truly powerful library.
After you'll understand how it works, ofc.
