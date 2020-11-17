import React, { useState, useCallback, useEffect } from "react";
import { render } from "react-dom";
import { makeStyles, ThemeProvider } from "@material-ui/styles";
import { createMuiTheme, Theme } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import Card from "@material-ui/core/Card";
import Typography from "@material-ui/core/Typography";
import CardContent from "@material-ui/core/CardContent";
import Grid from "@material-ui/core/Grid";
import DeleteIcon from "@material-ui/icons/Delete";
import IconButton from "@material-ui/core/IconButton";

import "./styles.css";

import examples from "./examples";
import Toolbar from "@material-ui/core/Toolbar";
import CardHeader from "@material-ui/core/CardHeader";

const theme = createMuiTheme();

const useStyles = makeStyles<Theme>(({ spacing }) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
  grid: {
    padding: spacing(2),
  },
  example: {
    marginBottom: spacing(2),
  },
}));

const Example: React.FC<{
  title: string;
  onDelete: () => void;
}> = ({ title, onDelete, children }) => {
  const classes = useStyles();
  return (
    <Card className={classes.example}>
      <CardHeader
        action={
          <IconButton onClick={onDelete} aria-label="settings">
            <DeleteIcon />
          </IconButton>
        }
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="h2">
          {title}
        </Typography>
        <Typography component="div">{children}</Typography>
      </CardContent>
    </Card>
  );
};

const App = () => {
  const classes = useStyles();

  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event: React.ChangeEvent<any>, newValue: any) => {
    setTabIndex(newValue);
  };

  useEffect(() => {
    setComponents({ ...examples[tabIndex]![1] });
  }, [tabIndex]);

  const [components, setComponents] = useState({ ...examples[tabIndex]![1] });

  const deleteComponent = useCallback(
    (name: string) => () => {
      delete (components as any)[name];
      setComponents({ ...components });
    },
    [components]
  );

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar variant="dense">
          <Typography variant="h6" color="inherit">
            Global Hook Store examples
          </Typography>
        </Toolbar>
        <Tabs
          value={tabIndex}
          variant="scrollable"
          scrollButtons="on"
          onChange={handleTabChange}
        >
          {examples.map(([k, v]) => (
            <Tab key={k} label={k} />
          ))}
        </Tabs>
      </AppBar>
      <Grid
        className={classes.grid}
        spacing={2}
        direction="row"
        justify="flex-start"
        alignItems="flex-start"
        container
      >
        {Object.entries(components).map(([name, Component]) => (
          <Grid key={name} item xs={12} md={6}>
            <Example onDelete={deleteComponent(name)} title={name}>
              {Component && <Component />}
            </Example>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

const rootElement = document.getElementById("root");
render(
  <ThemeProvider theme={theme}>
    <App />
  </ThemeProvider>,
  rootElement
);
