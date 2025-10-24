import { makeStyles } from "@material-ui/core"


const useStyles = makeStyles(theme => ({
  container: {
    maxWidth: 1500,
    margin: "auto",
    [theme.breakpoints.down(960)]: {
      width: "100vw",
    },
  },
  Arrow: {
    position: "absolute",
    top: "48%",
    transform: "translateY(-50%)",
    [theme.breakpoints.down(960)]: {
      display: "none",
    },
    zIndex: 2,
    width: "50px",
    height: "100px",
    color: "#d8d8d8 !important",
    cursor: "pointer",
    transition: "all .2s",
    '&:hover': { color: 'rgb(238, 130, 59) !important' }
  },
}))

export default useStyles
