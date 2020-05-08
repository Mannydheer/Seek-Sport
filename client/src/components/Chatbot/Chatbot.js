import React, { useState, useEffect } from 'react';
import ChatBot from 'react-simple-chatbot';
import { useHistory } from "react-router-dom";
import { ThemeProvider } from 'styled-components';
import styled from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';



const Chatbot = () => {

    let history = useHistory();

    const userLoggedIn = useSelector(state => state.userReducer)







    const handlePage = (props) => {
        // history.push(`/category/${props}`)
    }

    const theme = {
        background: 'white',
        headerBgColor: '#0D2538',
        headerFontColor: 'white',
        botBubbleColor: '#0D2538',
        botFontColor: 'white',
        userBubbleColor: 'white'
    }



    const config = {
        width: "300px",
        height: "400px",
        floating: true
    };

    const steps = [
        {
            //reffering to the step by Id
            id: 'Greet',
            message: `Hi ${userLoggedIn.user}!`,
            //will trigger next Id
            trigger: 'Welcome to Website',
        },
        {
            id: 'Welcome to Website',
            message: `Welcome to Seek & Sport! If you're looking for some people to play sports with, you are at the right place!`,
            trigger: 'Find Games',
        },
        {
            id: 'Find Games',
            message: "Are you ready to start finding games?",
            trigger: 'Topic',
        },
        {
            id: 'Topic',
            options: [
                { value: "Yes", label: "Yes", trigger: () => { return "Yes" } },
                { value: "No", label: "No", trigger: () => { return "No" } },
            ],
        },
        {
            id: 'Yes',
            message: `Great! Let me redirect you there!`,
            trigger: () => { history.push('/sports'); return 'Topic' },
        },
        {
            id: "No",
            message: `No problem, I'll let you keep browsing! Let me know when you're ready!`,
            trigger: () => { history.push('/'); return 'Topic' },
        },
        {
            id: 'Search',
            message: `You can use the search bar above to search for any products, also if you choose a category, you can search within that category! Looking for something else?`,
            trigger: 'Topic'
        },
        {
            id: 'Home',
            message: `Our Home Page!!! Are you looking for something else?`,
            trigger: () => { history.push('/'); return 'Topic' },
        },
        {
            id: 'Cart',
            message: `Btw you can keep track of your items if you make an account! Don't forget to add your coupon code! 
            Are you looking for something else?`,
            trigger: () => { history.push('/Cart'); return 'Topic' },
        },
        {
            id: 'Item Catalog',
            message: `This is our Shop page with a list of our items, browse away!
            Are you looking for something else?`,
            trigger: () => { history.push('/Shop'); return 'Topic' },
        },
        {
            id: 'Show Categories',
            options: [
                { value: 'Fitness', label: 'Fitness', trigger: () => { handlePage('Fitness'); return 'RedirectToCategory' } },
                { value: 'Medical', label: 'Medical', trigger: () => { handlePage('Medical'); return 'RedirectToCategory' } },
                { value: 'Lifestyle', label: 'Lifestyle', trigger: () => { handlePage('Lifestyle'); return 'RedirectToCategory' } },
                { value: 'Entertainment', label: 'Entertainment', trigger: () => { handlePage('Entertainment'); return 'RedirectToCategory' } },
                { value: 'Industrial', label: 'Industrial', trigger: () => { handlePage('Industrial'); return 'RedirectToCategory' } },
                { value: 'Pets and Animals', label: 'Pets and Animals', trigger: () => { handlePage('Pets and Animals'); return 'RedirectToCategory' } },
                { value: 'Gaming', label: 'Gaming', trigger: () => { handlePage('Gaming'); return 'RedirectToCategory' } },
            ],
        },
        {
            id: 'RedirectToCategory',
            message: `Here are the products for your selected category.Looking for something else?`,
            trigger: 'Topic',
        }
    ]




    return <div>

        <ThemeProvider theme={theme}>
            <ChatBot
                userAvatar={userLoggedIn.profileImage}
                headerTitle={'Seek & Sport Bot'}
                botAvatar={"https://img.icons8.com/dusk/64/000000/bot.png"}
                botDelay={1000}
                floating={true}

                steps={steps} {...config}
            />
        </ThemeProvider>
    </div>


}

export default Chatbot;