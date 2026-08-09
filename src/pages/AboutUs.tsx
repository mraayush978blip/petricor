export default function AboutUs() {
    return (
        <div className="container" style={{ padding: '60px 15px', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
            <h1 style={{ fontSize: '36px', color: '#7c5847', marginBottom: '20px', fontWeight: '600' }}>
                Our Story Begins at the Farm
            </h1>
            
            <div style={{ fontSize: '16px', lineHeight: '1.8', color: '#555', textAlign: 'left', marginTop: '40px' }}>
                <p style={{ marginBottom: '20px' }}>
                    Petricor is a botanical ingredient company rooted in Neemuch, Madhya Pradesh, one of India's most important regions for medicinal herbs. Our family has been part of the herb and spice trade here for generations. We know these farms, these farmers, and this soil. When we set out to build something of our own, we started from that knowledge and from a deep belief that the world deserves ingredients with a clear, honest story behind them.
                </p>
                <p style={{ marginBottom: '20px' }}>
                    Neemuch is a region where Ashwagandha, Fenugreek, Boswellia, Moringa, and many other botanicals are grown as primary crops, not side crops. Being here allows us to source directly from cultivating farmers, verify botanical identity before procurement, and maintain close control over what each Certificate of Analysis represents. Our batches are independently tested at NABL-accredited laboratories, so customers receive material backed by documented quality standards.
                </p>
                <p style={{ marginBottom: '20px' }}>
                    We supply botanical extracts, standardised herb powders, and functional ingredients to supplement brands, nutraceutical manufacturers, Ayurvedic companies, and formulators in over 30 countries. We are a young company, built on decades of regional knowledge about how these plants grow, where they come from, and what it takes to bring them to customers with integrity.
                </p>
                <blockquote style={{ 
                    borderLeft: '4px solid #7c5847', 
                    paddingLeft: '20px', 
                    marginTop: '40px', 
                    fontStyle: 'italic', 
                    fontSize: '20px', 
                    color: '#7c5847' 
                }}>
                    "We believe great ingredients begin long before the laboratory. They begin at the farm, with the right soil, the right plant, and someone close enough to the source to care."
                </blockquote>
            </div>
        </div>
    );
}
