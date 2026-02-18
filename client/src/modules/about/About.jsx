import React from 'react';
import { Helmet } from 'react-helmet'; // Helmet is now here
import AboutBanner from './AboutBanner';
import WhatWeDo from './WhatWeDo';
import MeetFounder from './MeetFounder';
import WhyChooseUs from './WhyChooseUs';
import OurVision from './OurVision';
import PropertyCTA from './FindYourProperty';

export default function About() {
  return (
    <>
      {/* SEO META DETAILS */}
      <Helmet>
        <title>Namma Pondy Properties | Real Estate with Kamar</title>
        <meta 
          name="description" 
          content="Trusted real estate in Pondicherry. Buy plots, villas & commercial properties with expert guidance from Kamar." 
        />
      </Helmet>

      {/* PAGE CONTENT */}
      <div className="bg-white">
        <AboutBanner />
        <WhatWeDo />
        <MeetFounder />
        <WhyChooseUs />
        <OurVision />
        <PropertyCTA />
        {/* Next sections will go here */}
      </div>
    </>
  );
}