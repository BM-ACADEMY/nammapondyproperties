import HeroSection from '../components/HeroSection';
import PropertyTypeList from '../components/PropertyTypeList';
import FeaturedProperties from '../components/FeaturedProperties';
import WhyChooseUs from '../components/WhyChooseUs';
import Testimonials from '../components/Testimonials';

const HomePage = () => {
  return (
    <div>
      <HeroSection />
      <PropertyTypeList />
      <FeaturedProperties />
      <WhyChooseUs />
      <Testimonials />
    </div>
  );
};

export default HomePage;
