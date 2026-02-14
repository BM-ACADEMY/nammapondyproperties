
import { CheckCircle, ShieldCheck } from 'lucide-react';

const WhyChooseUs = () => {
    const features = [
        { title: 'Verified Listings', description: 'Every property is physically verified by our team.' },
        { title: 'No Hidden Fees', description: 'Transparent pricing with zero hidden charges.' },
        { title: 'Expert Support', description: 'Dedicated support manager for every client.' },
        { title: 'Bank Loanz', description: 'Assistance with home loans from top banks.' },
    ];

    return (
        <section className="py-16 bg-blue-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-800">Why Choose NammaPondy?</h2>
                    <p className="text-gray-600 mt-2">We make property buying simple, secure, and transparent.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full mb-4">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h3 className="font-semibold text-lg text-gray-800 mb-2">{feature.title}</h3>
                            <p className="text-gray-600 text-sm">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUs;
