import { useState } from 'react';
import '../stylesheets/home.css'
import axios from 'axios';
import AdvertCard from './AdvertCard';

function Home() {
    const [text, setText] = useState('');
    const [company, setCompany] = useState([]);
    const [adsData, setadsData] = useState([]);
    
    return (
        <div className='container'>
            <div className='inputContainer'>
                <label htmlFor="companyInput">Search </label>
                <input type="text" id='companyInput' className='inputField' value={text} onChange={handleText} onKeyUp={handleKey} placeholder="Type here to see advert..." />
            </div>
            <AdvertCard company={company} adsData={adsData} />
        </div>
    );

    function handleText(event) {
        setText(event.target.value);
    }

    function handleKey(event) {
        if (event.key === "Enter") {
            axios.get('http://localhost:9192/data', {
                params: {
                    "queryString": event.target.value
                }
            }).then((res) => {
                setCompany(res.data.data.company);
                setadsData(res.data.data.adsData);
            })
        }
    }
}

export default Home;