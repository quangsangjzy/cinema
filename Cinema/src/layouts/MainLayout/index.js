import React from "react";

import ScrollToTop from "react-scroll-up";
import { makeStyles } from "@material-ui/core";

import Header from "./Header";
import Footer from "./Footer";

const useStyles = makeStyles((theme) => ({
    top: {
        marginTop: 64,
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

    var script = document.createElement('script');
    script.src = 'https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1';

    document.head.appendChild(script);

    return (
        <div>
            <div dangerouslySetInnerHTML={{
                __html: `
                    <df-messenger intent="WELCOME"
                        chat-title="Cinema"
                        agent-id="bbe51e01-a3c6-4b82-af1d-135ad535edfd"
                        language-code="vi"
                        id="chatbot"
                        name="chatbot">
                    </df-messenger>
                ` }} />

            <Header />
            <div className=""></div>
            {props.children}
            <Footer />
            <ScrollToTop showUnder={160}>
                <img
                    src="/img/top.png"
                    alt="totop"
                    className={classes.styleScrollToTop}
                />
            </ScrollToTop>
        </div>
    );
}