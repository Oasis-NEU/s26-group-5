//import { useState } from 'react'
import './Trade.css'
import arrows from './assets/arrows.png'

function Trade() {


    return(

        <>

            <div className="container">
                
                <div className="box1">
                    <h3>my books</h3>
                </div>

                
                <img src={arrows} className="arrows" alt="Vite logo" />
                

                <div className="box2">
                    <h3>their books</h3>
                </div>

            </div>

            <div className="button">
                <button className="confirm" onClick={() => alert("confirmed trade!")}>
                    confirm trade
                </button>    
            </div>  
            

            
        
        </>

    )

}


export default Trade