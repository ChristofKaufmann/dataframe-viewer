# Data Viewer

View tabular Jupyter variables and data files.

![Data Viewer with default settings](images/default-settings.png)

## Main Features

- View data in a **tabular grid** with sticky index and column headers.
- Show **dtype** and number of **missing values** per column.
- **Sort** with multiple keys.
- **Filter** using [Pandas' query syntax](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.query.html).
- Draw distribution **graphs** for each column, depending on data type:
  - Numeric column → Histogram
  - DateTime or TimeDelta column → Histogram
  - Ordered Categorical column → Bar Plot
  - String or Boolean column → Stacked Bar Plot
- **Quick filter** data from the distribution graphs.
- **Colorize** cells and graphs using a colormap with many settings.

## Usage

### View Data

Load Jupyter variables, when executing a Jupyter notebook or a Python script with the interactive window. You need to grant kernel access once. You can see the dtypes, enable the missing data count and refresh the table.

![Load Jupyter variable with Data viewer](images/open-jupyter-variable.gif)

Open files. *Note: Data types are not inferred from CSV or TSV files.* | View variables in debug mode.
---------------------------------------------------------------------- | -----------------------------
![Mouse pointing at "Open in Data Viewer" in CSV file context menu](images/open-in-data-viewer.png) | ![Mouse pointing at "View Value in Data Viewer" in debug variable context menu](images/open-from-debugger.png)

### Filter

Filter data using pandas query syntax.

![Filter data using query syntax](images/filter.gif)

### Sort

Stable sort with multiple keys (last has priority).

![Sort data using multiple columns](images/sort.gif)

### Graphs, Quick Filter, Colorize



## License

[MIT](LICENSE)
