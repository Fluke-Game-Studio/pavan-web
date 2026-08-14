import { Link, useLocation } from 'react-router-dom';
import './Breadcrumbs.css';

const Breadcrumbs = () => {
  const location = useLocation();
  
  // Split pathname and filter out empty strings
  const pathSegments = location.pathname.split('/').filter(segment => segment);
  
  // Don't show breadcrumbs on home page
  if (pathSegments.length === 0 || (pathSegments.length === 1 && pathSegments[0] === 'home')) {
    return null;
  }
  
  // Map route segments to readable labels
  const getLabel = (segment) => {
    const labels = {
      'careers': 'Careers',
      'apply': 'Apply for Position',
      'pavan': 'Pavan',
      'showcase': 'Showcase',
      'queenbee': 'Queen Bee Game',
      'about': 'About Us',
      'contact': 'Contact',
      'login': 'Login'
    };
    return labels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
  };
  
  // Build breadcrumb links
  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/');
    const label = getLabel(segment);
    const isLast = index === pathSegments.length - 1;
    
    return {
      path,
      label,
      isLast
    };
  });
  
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb navigation">
      <ol className="breadcrumbs__list">
        <li className="breadcrumbs__item">
          <Link to="/" className="breadcrumbs__link">
            Home
          </Link>
          <span className="breadcrumbs__separator">›</span>
        </li>
        {breadcrumbs.map((crumb, index) => (
          <li key={index} className="breadcrumbs__item">
            {crumb.isLast ? (
              <span className="breadcrumbs__current" aria-current="page">
                {crumb.label}
              </span>
            ) : (
              <>
                <Link to={crumb.path} className="breadcrumbs__link">
                  {crumb.label}
                </Link>
                <span className="breadcrumbs__separator">›</span>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
