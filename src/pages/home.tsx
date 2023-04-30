import Carousel from 'react-multi-carousel';
import React from 'react';
import 'react-multi-carousel/lib/styles.css';

export default function HomePage() {
  
  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 3000 },
      items: 3,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 2,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 1,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  };
  
  const newsItems = [
    {
      id: 1,
      title: 'Welcome to Wars World!',
      date: 'April 4, 2023',
      image: 'img/CO/Nell-full.png',
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod sem vel ante eleifend bibendum. Fusce varius ipsum eget tortor imperdiet, sed vulputate odio volutpat. Nunc sed purus id libero consequat ultrices sit amet eget tortor.',
    },
    {
      id: 2,
      title: 'New Map: Trench Warfare',
      date: 'April 20, 2023',
      image: 'img/CO/Andy-full.png',
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod sem vel ante eleifend bibendum. Fusce varius ipsum eget tortor imperdiet, sed vulputate odio volutpat. Nunc sed purus id libero consequat ultrices sit amet eget tortor.',
    },
    {
      id: 3,
      title: 'Top 10 map designs of all time',
      date: 'April 15, 2023',
      image: 'img/CO/Sami-full.png',
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod sem vel ante eleifend bibendum. Fusce varius ipsum eget tortor imperdiet, sed vulputate odio volutpat. Nunc sed purus id libero consequat ultrices sit amet eget tortor.',
    },
    {
      id: 3,
      title: 'New Unit: Tiny Tank',
      date: 'April 15, 2023',
      image: 'img/CO/Hachi-full.png',
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod sem vel ante eleifend bibendum. Fusce varius ipsum eget tortor imperdiet, sed vulputate odio volutpat. Nunc sed purus id libero consequat ultrices sit amet eget tortor.',
    },
  ];
/*

    
*/
  const css = `
    .section-title {
      font-size: 30px;
      text-align: center;
      padding-bottom: 48px;
      margin: 0;
      padding-top: 72px;
    }

    .news-header {
      position: absolute; 
      left: 50%; 
      top: 140px; 
      transform: translate(-50%, -50%);  
      paddingTop: 16px; 
      marginBottom: 64px; 
    }

    .video-container {
      width: calc(30vw);
      min-width: 250px;
      height: calc(calc(30vw / 16) * 9);
      min-height: calc(calc(250px / 16) * 9);
      background-color: #fff;
      padding: 4px 4px 4px 4px;
      border-radius: 8px;
      position: absolute;
      top: 250px;
      right: -30px;
      box-shadow: 0px 0px 16px rgba(0,0,0,0.1); 

      @media (min-width:700px){
        top: 300px;
      }

      @media (min-width:1000px){
        top: 300px;
        right: 0;
        left: 0;
        margin: 0 auto; 
      }
    }

    .circle {
      display: inline-block;
      width: 100%; height: 200px;
      position: relative;
      overflow: hidden;
      top: 4px
    }

    .circle:before {
      content: '';
      position: absolute;
      bottom: 50%;
      width: 100%; height: 100%;
      border-radius: 100%;
      box-shadow: 0px 300px 0px 300px #f8f8f8;
    }

    .site-title {
      text-align: center;
      font-size: 50px;

      @media (min-width:700px){
        font-size:65px;
      }

      @media (min-width:1000px){
        font-size:80px;
      }
    }

    .site-title-container {
      color: #fff;
      position: absolute;
      top: 50px;
      left: 0;
      right: 0; 
      margin: 0 auto;
    }

    .carousel-container {
      margin: 16px 26px 36px 26px; 
      backgroundColor: #fff; 
      padding: 32px;
      
      @media (min-width:700px){
        margin: 16px 36px 36px 36px;
      }

      @media (min-width:1024px){
        margin: 16px 16px 36px 16px;
      }
    }

    .trapezium:hover{
      border-bottom: 80px solid #fff;
      cursor: pointer;
      color: #fff;
    }

    .trapezium {
      border-bottom: 80px solid #111;
      border-left: 45px solid transparent;
      border-right: -20px solid transparent;
      height: 0;
      width: 272px;
      margin: 35px auto;
      color: #111;
    }

    .trapezium:before {
      border-bottom: 70px solid #CC3012;
      border-left: 40px solid transparent;
      border-right: 00px solid transparent;
      padding: 0 8px 0 0;
      height: 0px;
      width: 210px;
      position: absolute;
      bottom: -75px;
      left: -36px;
      content: "";
      z-index: -1;
    }

    .start-new-game-text {
      margin: 30px 0px 0px 10px;
      font-size: 20px;
      font-weight: bold;
    }
  `
  
  return (
    
    <div style={{marginBottom:"0", color: "#333", fontFamily: "Arial, sans-serif"}}>
      <style>
        {css}
      </style>
      <div>
        <div style={{maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "left" }}>
          <div style={{ width: "calc(66.66% - 16px)", paddingRight: "16px" }}>
            <div style={{ position: "relative", paddingBottom: "60%", height: "60vw" }}>
              <img 
                style={{overflow: "visable", position: "absolute", top: "0px", left: "-20%", height: "100vw", maxHeight: "1000px",  objectFit: "cover" }} 
                src={`img/orangeStarCos.png`}  
                alt="Hero"
              />
            </div>
          </div>
          <div style={{position: "relative", width: "calc(33.33% - 48px)", marginRight: "48px"}}>
            <div className="site-title-container">
              <h2 className="site-title" >
                Wars<br/> World
              </h2>
            </div>
            <div style={{marginRight:"20px"}}>
              <div className="video-container">
              
                <iframe
                  title="Featured Game Replay"
                  src="https://www.youtube.com/embed/ipy5lExelgE"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", width: "calc(100vw - 17px)",  left: "0px", padding: "0px 0px" }}>
        <div className="circle" style={{  margin: "0 auto" }}>
          
        </div>
        <div style={{ backgroundColor: "#f8f8f8",}}>

          <div style={{padding:"0px 10%"}} className="@rounded-lg @bg-black/70 @center @max-w-[75vw] @p-3 inProgress">
            <h2 className="section-title">Welcome to Wars World!</h2>
            <p>First of all, congrats on setting your developer environment!</p>
            <br/>
            <p>
              We are in the process of refactoring &quot;AW-Competitive&quot;/Wars
              World demo (FemboyDeveloper, Rey, Yeti et al.) into
              Typescript/React/Next.js + tRPC + Prisma/SQL (FunctionDJ&apos;s idea)
            </p>
            <br/>
            <p>
              Before you decide to take on one of our{' '}
              <a href={'https://github.com/WarsWorld/WarsWorld/issues'}>
                {' '}
                issues (most need to be triaged)
              </a>
              . Make sure you&apos;ve talked with us or gotten confirmation that no
              one else is working on that task. Otherwise, you risk working on
              something that&apos;s already being done.{' '}
            </p>
            <br/>
            <h3>
              Please have patience while we continue to do establish the basic
              foundation.
            </h3>
          </div>

          <h2 className='section-title' style={{ }}>
            Latest News
          </h2>
          
          <div style={{padding: "0px 0px"}}>
            <div style={{ maxWidth: "1200px", margin: "8px auto"}}>
              <Carousel 
                responsive={responsive}
                autoPlay={true}
                autoPlaySpeed={12000}
                infinite={true}
                showDots={true}
                removeArrowOnDeviceType={["tablet", "mobile"]}
              >
                {newsItems.map((item) => (
                  
                <div key={item.id} className="carousel-container" style={{backgroundColor: "#fff", borderRadius: "8px", boxShadow: "0px 0px 16px rgba(0,0,0,0.1)" }}>
                  <img 
                    src={item.image}
                    alt="news item"
                    style={{float:"right", height:"100px", width:"100px", objectFit:"cover", objectPosition: "top", border: "solid 2px #111" }}
                  />  
                  <h3 style={{ marginBottom: "8px" }}>{item.title}</h3>
                  <h5 style={{ marginBottom: "16px" }}>{item.date}</h5>
                  
                  <p>
                    {item.text}
                  </p>
                  <a href="#" style={{ color: "#333", textDecoration: "none", display: "block", marginTop: "16px" }}>
                    Read More
                  </a>
                </div>
                ))}
              </Carousel>
            </div>
          </div>
              
          <h2 className='section-title' style={{ paddingTop: "88px", }}>
          Featured Maps
          </h2>
          <div style={{ maxWidth: "1200px", paddingBottom:"32px", margin: "0px auto",  display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ width: "calc(50% - 16px)", marginRight: "16px" }}>
              <div style={{ backgroundColor: "#fff", padding: "32px", borderRadius: "8px", boxShadow: "0px 0px 16px rgba(0,0,0,0.1)" }}>
                <h3 style={{ marginBottom: "16px" }}>New Map: Trench Warfare</h3>
                
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod sem vel ante eleifend bibendum. Fusce varius ipsum eget tortor
                  imperdiet, sed vulputate odio volutpat. Nunc sed purus id libero consequat ultrices sit amet eget tortor.
                </p>
                <a href="#" style={{ color: "#333", textDecoration: "none", display: "block", marginTop: "16px" }}>
                  Read More
                </a>
              </div>
            </div>
            <div style={{ width: "calc(50% - 16px)" }}>
              <div style={{ backgroundColor: "#fff", padding: "32px", borderRadius: "8px", boxShadow: "0px 0px 16px rgba(0,0,0,0.1)" }}>
                <h3 style={{ marginBottom: "16px" }}>New Unit: Artillery</h3>
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod sem vel ante eleifend bibendum. Fusce varius ipsum eget tortor
                  imperdiet, sed vulputate odio volutpat. Nunc sed purus id libero consequat ultrices sit amet eget tortor.
                </p>
                <a href="#" style={{ color: "#333", textDecoration: "none", display: "block", marginTop: "16px" }}>
                  Read More
                </a>
              </div>
            </div>
          </div>
        </div>

        <div style={{marginTop: "30px"}}>div</div>
      </div>
      <div>
        
        <div style={{position: "fixed", left: "0px", bottom:"0px", height: "50px", width: "100%", backgroundColor: "#111" }}>
          <a href="/match" className="trapezium" style={{ bottom: "-34px", right: "-20px", position: "fixed"}}>
            <div className="start-new-game-text">Start New Game</div>
          </a>
        </div>
      </div>
    </div>

  );
}
