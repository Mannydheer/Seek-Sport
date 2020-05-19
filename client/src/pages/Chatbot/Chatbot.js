import React from "react";
//reference chatbot
import ChatBot from "react-simple-chatbot";
import { useHistory } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { useSelector } from "react-redux";

const Chatbot = () => {
  let history = useHistory();
  const userLoggedIn = useSelector((state) => state.userReducer);
  const theme = {
    background: "white",
    headerBgColor: "#0D2538",
    headerFontColor: "white",
    botBubbleColor: "#0D2538",
    botFontColor: "white",
    userBubbleColor: "white",
  };
  const config = {
    width: "300px",
    height: "400px",
    floating: true,
  };
  const steps = [
    {
      //reffering to the step by Id
      id: "Greet",
      message: `Hi ${userLoggedIn.user}!`,
      //will trigger next Id
      trigger: "Welcome to Website",
    },
    {
      id: "Welcome to Website",
      message: `Welcome to Seek & Sport! If you're looking for some people to play sports with, you are at the right place!`,
      trigger: "Find Games",
    },
    {
      id: "Find Games",
      message: "Are you ready to start finding games?",
      trigger: "YesNo",
    },
    {
      id: "YesNo",
      options: [
        {
          value: "Yes",
          label: "Yes",
          trigger: () => {
            return "Yes";
          },
        },
        {
          value: "No",
          label: "No",
          trigger: () => {
            return "No";
          },
        },
      ],
    },
    {
      id: "Yes",
      message: `Great! Let me redirect you there! Also here are some other options.`,
      trigger: () => {
        history.push("/sports");
        return "Options";
      },
    },
    {
      id: "No",
      message: `No problem, I'll let you keep browsing, also here are some other options. `,
      trigger: () => {
        history.push("/");
        return "Options";
      },
    },
    {
      id: "Options",
      options: [
        {
          value: "Your events?",
          label: "Your events?",
          trigger: () => {
            history.push("/userEvents");
            return "Redirect";
          },
        },
        {
          value: "Your activities?",
          label: "Your activities?",
          trigger: () => {
            history.push("/userActivities");
            return "Redirect";
          },
        },
        {
          value: "Home Page",
          label: "Home Page",
          trigger: () => {
            history.push("/");
            return "Redirect";
          },
        },
        {
          value: "Chat Room",
          label: "Chat Room",
          trigger: () => {
            history.push("/chat");
            return "Redirect";
          },
        },
      ],
    },
    {
      id: "Redirect",
      message: `There you go! Looking for something else?`,
      trigger: "Options",
    },
  ];
  return (
    <div>
      <ThemeProvider theme={theme}>
        <ChatBot
          userAvatar={userLoggedIn.profileImage}
          headerTitle={"Seek & Sport Bot"}
          botAvatar={"https://img.icons8.com/dusk/64/000000/bot.png"}
          botDelay={1000}
          floating={true}
          steps={steps}
          {...config}
        />
      </ThemeProvider>
    </div>
  );
};

export default Chatbot;
