import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    backgroundColor: "#0b1a2d", // nền tối kiểu BHD
    color: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    minHeight: 600,
  },

  /* --- Panel bên trái: logo hệ thống rạp --- */
  leftPanel: {
    width: "20%",
    borderRight: "1px solid #1c2a3e",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#0e2035",
    paddingTop: 20,
    overflowY: "auto",
  },
  tabItem: {
    minWidth: "100%",
    padding: "20px 0",
    "&:hover": {
      backgroundColor: "#143455",
    },
  },
  tabSelected: {
    backgroundColor: "#1f3e66 !important",
  },
  tabWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: "50%",
    objectFit: "contain",
  },
  theaterName: {
    color: "#fff",
    fontWeight: 600,
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },

  /* --- Panel bên phải: chi tiết lịch chiếu --- */
  rightPanel: {
    flex: 1,
    backgroundColor: "#102541",
    padding: "20px 30px",
    overflowY: "auto",
  },

  /* --- Các cụm rạp --- */
  wrapperContainer: {
    backgroundColor: "#132c51",
    borderRadius: 8,
    padding: 20,
  },
  listDay: {
    display: "flex",
    overflowX: "auto",
    gap: 10,
    paddingBottom: 10,
    marginBottom: 20,
  },
  dayItem: {
    flex: "0 0 auto",
    backgroundColor: "#203b63",
    borderRadius: 8,
    padding: "10px 16px",
    textAlign: "center",
    cursor: "pointer",
    color: "#fff",
    transition: "0.2s",
    "&:hover": {
      backgroundColor: "#ee823b",
    },
  },
  activeDay: {
    backgroundColor: "#ee823b",
  },
  cumRapBox: {
    backgroundColor: "#1b335b",
    borderRadius: 10,
    padding: "18px 20px",
    marginBottom: 15,
  },
}));

export default useStyles;
