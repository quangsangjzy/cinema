import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(() => ({
  showtimePage: {
    backgroundColor: "#111",
    color: "#fff",
    padding: "100px 0",
    minHeight: "100vh",
  },

  showtimeHeader: {
    textAlign: "center",
    marginBottom: 30,
    "& h1": {
      fontSize: 36,
      fontWeight: 700,
      letterSpacing: 1,
    },
  },

  tabButtons: {
    marginTop: 20,
    "& button": {
      background: "none",
      color: "#ccc",
      border: "2px solid #444",
      padding: "10px 20px",
      margin: "0 10px",
      cursor: "pointer",
      transition: "0.3s",
      borderRadius: 6,
      fontSize: 16,
      "&:hover": {
        backgroundColor: "#5cb85c",
        color: "#fff",
      },
    },
    "& .active": {
      backgroundColor: "#5cb85c",
      color: "#fff",
    },
  },

  movieGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: 20,
    padding: "0 10%",
  },

  movieCard: {
    backgroundColor: "#1b1b1b",
    borderRadius: 10,
    padding: 15,
    textAlign: "center",
    transition: "0.3s",
    "&:hover": {
      transform: "translateY(-5px)",
      backgroundColor: "#222",
    },
    "& img": {
      width: "100%",
      height: 280,
      objectFit: "cover",
      borderRadius: 8,
    },
    "& h5": {
      marginTop: 10,
      color: "#fff",
      fontSize: 16,
    },
    "& p": {
      fontSize: 13,
      color: "#aaa",
      margin: "6px 0",
    },
  },

  btnPrimary: {
    marginTop: 10,
    backgroundColor: "#5cb85c",
    color: "#fff",
    border: "none",
    padding: "8px 12px",
    borderRadius: 5,
    cursor: "pointer",
    transition: "0.3s",
    "&:hover": {
      backgroundColor: "#4cae4c",
    },
  },
}));

export default useStyles;
