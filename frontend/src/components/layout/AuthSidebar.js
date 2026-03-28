import React, { useState, useEffect } from "react";
import { Sparkles, Layout, BarChart3, BellRing } from "lucide-react";
import "../../styles/AuthLayout.css";

const AuthSidebar = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            badge: "COMMUNITY HUB",
            title: "Quest for Knowledge",
            image: "/login_transformation.png",
            description: "Level up your campus experience with a seamless digital information hub.",
            icon: <Sparkles className="slide-icon" size={24} />
        },
        {
            badge: "CENTRAL COMMAND",
            title: "Master Your Realm",
            image: "/login_notice_portal.png",
            description: "Navigate all campus notices and official alerts through your unified dashboard.",
            icon: <Layout className="slide-icon" size={24} />
        },
        {
            badge: "RANKINGS & STATS",
            title: "Ascend the Ranks",
            image: "/login_exam_flow.png",
            description: "Monitor your academic performance and trends with real-time data visualization.",
            icon: <BarChart3 className="slide-icon" size={24} />
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [slides.length]);

    return (
        <div className="auth-sidebar">
            <div className="sidebar-background-elements">
                <div className="bg-circle pos-1"></div>
                <div className="bg-circle pos-2"></div>
                <div className="bg-grid"></div>
            </div>
            
            <div className="auth-carousel">
                {slides.map((slide, idx) => (
                    <div 
                        key={idx} 
                        className={`carousel-slide ${idx === currentSlide ? 'active' : 'inactive'}`}
                    >
                        <div className="image-container-wrapper">
                            <div className="floating-decorations">
                                <div className="float-item item-1"><BellRing size={20} /></div>
                                <div className="float-item item-2"><Sparkles size={20} /></div>
                            </div>
                            <div className="image-wrapper">
                                <img
                                    src={slide.image}
                                    alt={slide.title}
                                    className="illustration-img"
                                />
                            </div>
                        </div>
                        
                        <div className="slide-content-glass">
                            <div className="slide-badge">
                                {slide.icon}
                                <span>{slide.badge}</span>
                            </div>
                            <h2>{slide.title}</h2>
                            <p>{slide.description}</p>
                        </div>
                    </div>
                ))}

                <div className="carousel-indicators">
                    {slides.map((_, idx) => (
                        <div
                            key={idx}
                            className={`indicator ${idx === currentSlide ? 'active' : ''}`}
                            onClick={() => setCurrentSlide(idx)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AuthSidebar;
