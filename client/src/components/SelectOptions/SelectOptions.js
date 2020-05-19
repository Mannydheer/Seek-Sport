import React, { useRef } from "react";
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Button from "@material-ui/core/Button";

const useStyles = makeStyles((theme) => ({
  button: {
    display: "block",
    marginTop: theme.spacing(2),
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}));

export default function SelectOptions({ option, setOptions, data }) {
  const classes = useStyles();
  // const [open, setOpen] = React.useState(false);

  const handleChange = (event) => {
    setOptions(event.target.value);
  };

  return (
    <div>
      <FormControl className={classes.formControl}>
        <InputLabel id="demo-controlled-open-select-label"></InputLabel>
        <Select
          labelId="demo-controlled-open-select-label"
          id="demo-controlled-open-select"
          value={option}
          onChange={handleChange}
        >
          {data.map((choice) => {
            return <MenuItem key={choice}>{choice}</MenuItem>;
          })}
        </Select>
      </FormControl>
    </div>
  );
}
