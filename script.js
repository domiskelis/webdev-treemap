//functions to be called from page
function fetchData(url) {
  fetch(url).
  then(response => response.json()).
  then(data => {createGraph(data);});
};
function createGraph(data) {
  //remove any old graph
  d3.selectAll("#chart > *").remove();
  d3.selectAll("#legend > *").remove();
  //dimensions
  const width = 900;
  const height = 900;
  const padding = 0;

  //main chart set-up
  let svg = d3.select("#chart").
  append("svg").
  attr("width", width).
  attr("height", height);

  //tooltip set-up
  let tooltip = d3.select("#chart").
  append("div").
  attr("id", "tooltip").
  style("z-index", "10").
  style("white-space", "no-wrap").
  style("opacity", 0).
  style("position", "absolute");
  const mouseover = (event, d) => {
    tooltip.style("opacity", 1).
    attr("data-value", d.data.value);
  };
  const mouseleave = (event, d) => {
    tooltip.style('opacity', 0);
    document.getElementById("tooltip").innerHTML = '';
  };
  const mousemove = (event, d) => {
    let text = `Name: ${d.data.name}</br> Value: ${d.data.value}</br> Category: ${d.data.category}`;

    tooltip.style("top", event.pageY - 10 + "px").style("left", event.pageX + 10 + "px");
    document.getElementById("tooltip").innerHTML = text;
  };

  //treemap functions
  let root = d3.hierarchy(data).
  sum(d => {return Number(d.value);}).
  sort((a, b) => b.height - a.height || b.value - a.value);;
  d3.treemap().
  size([width, height]).
  padding(1).
  tile(d3.treemapSquarify)(
  root);

  //color styles
  let colors = ["rgba(214,32,32,1)", "rgba(179,78,102,1)", "rgba(255,107,182,1)", "rgba(193,198,119,1)",
  "rgba(255,223,35,1)", "rgba(255,154,1,1)", "rgba(235,191,144,1)", "rgba(171,97,31,1)",
  "rgba(73,200,79,1)", "rgba(94,204,8,1)", "rgba(145,212,165,1)", "rgba(236,124,124,1)",
  "rgba(135,135,135,1)", "rgba(30,98,136,1)", "rgba(178,198,166,1)", "rgba(152,182,204,1)",
  "rgba(107,128,144,1)", "rgba(148,95,189,1)", "rgba(229,162,237,1)", "rgba(177,146,111,1)"];
  colors.sort(() => Math.random() - 0.5);
  let categories = [];

  //cells to contain rects
  const cells = svg.selectAll('g').
  data(root.leaves()).
  join('g').
  attr('transform', d => `translate(${d.x0},${d.y0})`);

  //rectangles
  cells.append("rect").
  attr("width", d => d.x1 - d.x0).attr("height", d => d.y1 - d.y0).
  attr("class", "tile").
  attr("data-name", d => d.data.name).
  attr("data-category", d => d.data.category).
  attr("data-value", d => d.data.value).
  style("fill", d => {
    if (!categories.includes(d.data.category)) {categories.push(d.data.category);}
    return colors[categories.indexOf(d.data.category)];
  }).
  on("mousemove", mousemove).on("mouseleave", mouseleave).on("mouseover", mouseover);

  //text labels
  const fontSize = 9;
  function parseCellText(d) {
    let cellW = d.x1 - d.x0;
    let words = d.data.name.split(/\s+/);
    let lines = [];
    let newLine = [];
    while (words.length > 0) {
      let newWord = words.shift();
      let line = newLine.join(" ");
      let lineW = 6 * (line.length + newWord.length);
      if (lineW > cellW) {
        lines.push(line);
        newLine = [newWord];
      } else {newLine.push(newWord);}
    }
    lines.push(newLine.join(" "));
    return lines;
  };
  cells.append("text").
  attr("x", 1).
  attr("y", fontSize + "px").
  selectAll("tspan").
  data(d => parseCellText(d)).
  enter().
  append("tspan").
  attr("x", 2).
  attr('y', (d, i) => 13 + 10 * i).
  text(d => d).
  attr("class", "title").
  attr("font-size", fontSize);

  //legend
  const legendWidth = width / 3;
  const legendHeight = height;
  const legendFontSize = 20;
  const legend = d3.select("#legend").append("svg").
  attr("width", legendWidth).attr("height", legendHeight);
  document.getElementById("legend-title").style.opacity = 1;

  let legendData = categories.map((x, i) => {
    let pairObj = {};
    pairObj.category = x;
    pairObj.color = colors[i];
    return pairObj;
  });
  const legendCells = legend.selectAll('g').
  data(legendData).join('g').
  attr('transform', (d, i) => `translate(0,${i * 40})`);
  legendCells.append("rect").
  attr("width", 30).attr("height", 30).
  attr("class", "legend-item").
  style("fill", d => d.color);
  legendCells.append("text").
  attr("x", 35).
  attr("y", legendFontSize + "px").
  text(d => d.category).
  attr("font-size", legendFontSize);
};

//datasets and page info
const dataKickstarters = {
  title: "Top Kickstarter Pledges",
  url: "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json",
  description: "Top 100 Most Pledged Kickstarter Campaigns by Type of Product",
  icon: "fa-brands fa-kickstarter" };

const dataMovies = {
  title: "Top Movie Sales",
  url: "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json",
  description: "Top 100 Highest Grossing Movies by Genre",
  icon: "fa-solid fa-film" };

const dataGames = {
  title: "Top Selling Video Games",
  url: "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json",
  description: "Top 100 Best Selling Video Games by Gaming Platform",
  icon: "fa-solid fa-gamepad" };

const dataPalette = {
  title: "Randomise",
  icon: "fa-solid fa-swatchbook" };

const buttonResponder = {
  "kickstarter-button": dataKickstarters,
  "movies-button": dataMovies,
  "games-button": dataGames,
  "palette-button": dataPalette };

const defaultState = {
  title: "D3 Treemap Grapher",
  description: "Select one of the three datasets to display a treemap!" };


//interactive page renderer
class Grapher extends React.Component {
  constructor(props) {
    super(props);
    this.state = defaultState;
    this.changeGraph = this.changeGraph.bind(this);
    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
  }

  changeGraph(event) {
    let buttonID = event.currentTarget.id;
    if (buttonID === "palette-button") {
      fetchData(this.state.url);
    } else if (buttonResponder[buttonID].title !== this.state.title) {
      let updatedState = buttonResponder[buttonID];
      this.setState(updatedState);
      fetchData(updatedState.url);
    };
  }

  handleMouseOver(event) {
    const buttonLabeler = document.getElementById("button-label");
    buttonLabeler.style.opacity = 1;
    buttonLabeler.innerHTML = buttonResponder[event.currentTarget.id].title;
  }
  handleMouseMove(event) {
    const buttonLabeler = document.getElementById("button-label");
    buttonLabeler.style.top = event.pageY + "px";
    buttonLabeler.style.left = event.pageX + 15 + "px";
  }
  handleMouseOut() {
    const buttonLabeler = document.getElementById("button-label");
    buttonLabeler.style.opacity = 0;
  }

  render() {
    //create buttons
    const grapherButtons = [];
    Object.keys(buttonResponder).forEach(id => {
      grapherButtons.push( /*#__PURE__*/
      React.createElement("button", { class: "button", type: "button", id: id,
        onClick: this.changeGraph,
        onMouseEnter: e => {this.handleMouseOver(e);},
        onMouseLeave: this.handleMouseOut,
        onMouseMove: this.handleMouseMove }, /*#__PURE__*/
      React.createElement("i", { class: buttonResponder[id].icon })));

    });
    //process description and link
    let description = [];
    if (this.state.hasOwnProperty("url") > 0) {
      description.push( /*#__PURE__*/
      React.createElement("span", null, this.state.description, ". Data retrieved from ", /*#__PURE__*/React.createElement("a", { href: this.state.url }, "this JSON"), "."));
    } else {description.push(this.state.description);};
    //render page
    return /*#__PURE__*/(
      React.createElement("div", { id: "wrapper" }, /*#__PURE__*/
      React.createElement("div", { id: "head-block", class: "non-graph" }, /*#__PURE__*/
      React.createElement("h1", { id: "title" }, this.state.title), /*#__PURE__*/
      React.createElement("div", { id: "description", class: "description-container" }, description), /*#__PURE__*/
      React.createElement("div", { id: "toggles", class: "toggles-container" }, /*#__PURE__*/
      React.createElement("div", { id: "button-label", class: "button-label" }), /*#__PURE__*/
      React.createElement("div", { id: "data-button-label" }, "Display a dataset:"), /*#__PURE__*/
      React.createElement("div", { id: "or-text" }, "OR"), /*#__PURE__*/
      React.createElement("div", { id: "palette-button-label" }, "Shuffle colors:"),
      grapherButtons)), /*#__PURE__*/


      React.createElement("div", { id: "graph-box", class: "graph-box" }, /*#__PURE__*/
      React.createElement("div", { id: "chart", class: "chart-container" }), /*#__PURE__*/
      React.createElement("div", { id: "legend-title" }, "Legend:"), /*#__PURE__*/
      React.createElement("div", { id: "legend", class: "legend-container" }))));



  }}
;

ReactDOM.render( /*#__PURE__*/React.createElement(Grapher, null), document.getElementById("body"));

console.log(parseFloat("23749990"));