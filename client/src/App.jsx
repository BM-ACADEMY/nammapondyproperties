import { useState } from 'react'
import './App.css'
import { Button, Input, Typography, Card, Tag, Space } from 'antd';
import { Home, Hammer, Mail, Phone, MapPin, Globe } from 'lucide-react';
import logo from "./assets/md.png"

const { Title, Text, Paragraph } = Typography;

function App() {
  return (
    <>
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6 relative overflow-hidden">

        {/* Background Decorative Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

        {/* Main Content Card */}
        <div className="max-w-lg w-full text-center z-10">

          {/* 1. Owner/Logo Image */}
          <div className="relative mx-auto mb-6 w-40 h-40">
            <div className="w-full h-full rounded-full p-1 bg-white shadow-xl ring-1 ring-gray-200">
              <img
                src={logo}
                alt="Namma Pondy Properties Logo"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full shadow-lg border-2 border-white">
              <Home size={20} />
            </div>
          </div>

          {/* 2. Content Section */}
          <div className="space-y-6">

            <div className="space-y-2">
              {/* Business Name */}
              <Title level={2} className="uppercase tracking-widest text-blue-600" style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                Namma Pondy Properties
              </Title>

              <Tag color="blue" className="px-4 py-1 text-sm rounded-full border-blue-200 bg-blue-50 text-blue-700 font-medium">
                <span className="flex items-center gap-2">
                  <Hammer size={14} /> Under Development
                </span>
              </Tag>
            </div>

            {/* Main Heading */}
            <div className="space-y-2">
              <Title level={1} style={{ margin: 0, fontWeight: 800, color: '#1f2937' }}>
                Something <span className="text-blue-600">Amazing</span> is Building
              </Title>
              <Text className="text-gray-500 text-lg block italic">
                Pondicherry's Premium Real Estate Solutions
              </Text>
            </div>

            {/* Description */}
            <Paragraph className="text-gray-600 text-base leading-relaxed max-w-md mx-auto">
              We are crafting a next-generation platform to help you find your dream property in Pondy effortlessly.
              Advanced searches, virtual tours, and direct connections are coming your way.
            </Paragraph>

            {/* Optional: Simple Contact/Social Placeholder */}
            <div className="pt-4 flex justify-center gap-4 text-gray-400">
               <div className="flex items-center gap-1 text-sm">
                 <Globe size={16} /> nammapondyproperties.com
               </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

export default App
