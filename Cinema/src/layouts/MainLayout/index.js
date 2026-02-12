import React, { useEffect } from "react";
import ScrollToTop from "react-scroll-up";
import { makeStyles } from "@material-ui/core";

import Header from "./Header";
import Footer from "./Footer";

const useStyles = makeStyles((theme) => ({
  top: {
    marginTop: 90,
    [theme.breakpoints.down("xs")]: {
      marginTop: 56,
    },
  },
  styleScrollToTop: {
    position: "fixed",
    bottom: 30,
    left: 10,
    transitionTimingFunction: "linear",
    width: 50,
    zIndex: 5000,
  },
}));

export default function MainLayout(props) {
  const classes = useStyles();

  useEffect(() => {
    const SCRIPT_ID = "df-messenger-script";
    const existing = document.getElementById(SCRIPT_ID);

    if (!existing) {
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src =
        "https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1";
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div>
      {/* render df-messenger trực tiếp, không cần dangerouslySetInnerHTML */}
      <df-messenger
        intent="WELCOME"
        chat-title="Cinema"
        agent-id="bbe51e01-a3c6-4b82-af1d-135ad535edfd"
        language-code="vi"
        id="chatbot"
      />

      <Header />
      <div className={classes.top}>{props.children}</div>
      <Footer />

      <ScrollToTop showUnder={160}>
        <img src="/img/top.png" alt="totop" className={classes.styleScrollToTop} />
      </ScrollToTop>
    </div>
  );
}
