import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles(() => ({
  container: {
    display: "flex",
    backgroundColor: "#0b1a2d",
    color: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    minHeight: 600,
  },

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
    cursor: "pointer",
    userSelect: "none",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    "&:hover": { backgroundColor: "#143455" },
  },

  tabSelected: { backgroundColor: "#1f3e66 !important" },

  tabWrapper: { flexDirection: "row", alignItems: "center", gap: 12 },

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

  rightPanel: {
    flex: 1,
    backgroundColor: "#102541",
    padding: "20px 30px",
    overflowY: "auto",
  },

  emptyNote: {
    padding: 16,
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
  },

  emptyRight: {
    padding: 16,
    color: "rgba(255,255,255,0.75)",
    textAlign: "center",
  },

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
    "&:hover": { backgroundColor: "#ee823b" },
  },

  activeDay: { backgroundColor: "#ee823b" },

  cumRapBox: {
    backgroundColor: "#1b335b",
    borderRadius: 10,
    padding: "18px 20px",
    marginBottom: 15,
  },

  gioChieuWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
  },

  gioChieuItem: {
    border: "1px solid rgba(255,255,255,0.18)",
    backgroundColor: "rgba(0,0,0,0.18)",
    color: "#fff",
    borderRadius: 10,
    padding: "10px 14px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all .15s ease",
    outline: "none",
    "&:hover": {
      borderColor: "rgba(238,130,59,0.8)",
      backgroundColor: "rgba(238,130,59,0.18)",
      transform: "translateY(-1px)",
    },
    "&:active": { transform: "translateY(0px)" },
  },
}));

export default useStyles;