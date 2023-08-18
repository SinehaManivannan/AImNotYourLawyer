import { useState } from "react";
import { NavLink } from "react-router-dom";
import styles from "../../styles/SideBar.module.css";

import HomeIcon from '@mui/icons-material/Home';
import MenuIcon from '@mui/icons-material/Menu';
import PeopleIcon from '@mui/icons-material/People';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import FeedbackIcon from '@mui/icons-material/Feedback';
import LogoutIcon from '@mui/icons-material/Logout';

import { auth } from "../../firebase";
import { useNavigate } from 'react-router-dom';

const handleLogout = () => {
    console.log('handle logout');
};
const navigate = useNavigate();

const navDataLink = [
    {
        id: 0,
        text: "About Us",
        link: "https://myopencourt.org/about-us/"
    },
    {
        id: 1,
        text: "Blogs",
        link: "https://myopencourt.org/blog/"
    },
    {
        id: 2,
        text: "FAQs",
        link: "https://myopencourt.org/faqs/"
    },
    {
        id: 3,
        text: "Contact",
        link: "mailto:conflict.analytics@gmail.com"
    }
]
const navDataConvo = [
    {
        id: 4,
        icon: <RefreshIcon/>,
        text: "Refresh Conversation",
        onClick: navigate('/chat'),
    },
    {
        id: 5,
        icon: <AddIcon/>,
        text: "New Conversation",
    },
    {
        id: 6,
        icon: <CloseIcon/>,
        text: "Clear Conversation",
    },
    {
        id: 7,
        icon: <SaveIcon/>,
        text: "Save Conversation",
    },
    {
        id: 8,
        icon: <FeedbackIcon/>,
        text: "Feedback",
    },
    {
        id: 9,
        icon: <LogoutIcon/>,
        text: "Logout",
    }
]

export default function SideBar() {
    const [open, setopen] = useState(false);
    const toggleOpen = () => {
        setopen(!open)
    }
    return (
        <div className={open?styles.sidenav:styles.sidenavClosed}>
            {/* <button className={styles.menuBtn} onClick={toggleOpen}>
                {open? <MenuIcon /> : <MenuIcon/>}
            </button> */}
            <button className={open?styles.menuOpen:styles.menuBtn} onClick={toggleOpen}>
                <MenuIcon />
            </button>
            <div className={styles.aboutBar}>
                {open && navDataLink.map(item => {
                    return <NavLink key={item.id} className={styles.sideitemLink} to={item.link}>
                        {item.icon}
                        <span className={styles.linkTextAbout}>{item.text}</span>
                    </NavLink>
                })}
            </div>

            <div className={styles.convoBar}>
                {navDataConvo.map(item =>{
                    return <NavLink key={item.id} className={styles.sideitemConvo} onClick={item.onClick}>
                    {item.icon}
                    <span className={styles.linkText}>{item.text}</span>
                        </NavLink>
                })}
            </div>
            
        </div>
    )
    
}

