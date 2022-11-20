import '../stylesheets/advertCard.css';

function AdvertCard(props) {
    return (
        <>

            {
                props.adsData.length > 0 && props.company.length > 0 ?
                    (<div className='cardContainer'>
                        {
                            props.adsData.map((item, index) => {
                                return (
                                    <div key={index} className="imageContainer">
                                        <img src={item.imageURL} alt="advertImg" />
                                    </div>
                                )
                            })
                        }
                    </div>) : props.company.length > 0 ? (
                        <div className='noAdCardContainer'>
                            <div className='noAdContainer'>
                                <h1>No Advert available</h1>
                                <h2>Only company({props.company[0].name}) data available</h2>
                            </div>
                        </div>
                    ) : <></>
            }
        </>
    )
}

export default AdvertCard;