import React from 'react';
import Link from 'next/link';

const SearchSection = () => {
  return (
    <div className="container margin_120_95">
      <div className="main_title">
        <h2>Find Local Businesses & Services</h2>
        <p>Discover trusted shops, services, and professionals near you. Publicin helps you easily connect with local businesses and explore everything your city has to offer.</p>
      </div>
      
      <div className="row justify-content-center">
        <div className="col-xl-4 col-lg-5 col-md-6">
          <div className="list_home">
            <div className="list_title">
              <i className="icon_pin_alt"></i>
              <h3>Search by Indian Cities</h3>
            </div>
            <ul>
              <li><Link href="/list"><strong>89</strong>Delhi</Link></li>
              <li><Link href="/list"><strong>76</strong>Mumbai</Link></li>
              <li><Link href="/list"><strong>68</strong>Bangalore</Link></li>
              <li><Link href="/list"><strong>62</strong>Hyderabad</Link></li>
              <li><Link href="/list"><strong>58</strong>Chennai</Link></li>
              <li><Link href="/list"><strong>54</strong>Kolkata</Link></li>
              <li><Link href="/list"><strong>49</strong>Pune</Link></li>
              <li><Link href="/list"><strong>45</strong>Ahmedabad</Link></li>
              <li><Link href="/list"><strong>41</strong>Jaipur</Link></li>
              <li><Link href="/list">More Cities...</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="col-xl-4 col-lg-5 col-md-6">
          <div className="list_home">
            <div className="list_title">
              <i className="icon_archive_alt"></i>
              <h3>Search by Business Type</h3>
            </div>
            <ul>
              <li><Link href="/list"><strong>234</strong>Restaurants</Link></li>
              <li><Link href="/list"><strong>198</strong>Doctors & Clinics</Link></li>
              <li><Link href="/list"><strong>167</strong>Salons & Spas</Link></li>
              <li><Link href="/list"><strong>145</strong>Electricians</Link></li>
              <li><Link href="/list"><strong>132</strong>Plumbers</Link></li>
              <li><Link href="/list"><strong>118</strong>Schools & Tutors</Link></li>
              <li><Link href="/list"><strong>107</strong>Real Estate</Link></li>
              <li><Link href="/list"><strong>95</strong>Lawyers</Link></li>
              <li><Link href="/list"><strong>84</strong>IT Services</Link></li>
              <li><Link href="/list">More Services...</Link></li>
            </ul>
          </div>
        </div>
      </div>
      {/* /row */}
    </div>
  );
};

export default SearchSection;