import React, { useEffect, useState } from 'react';
import '../birthday/BirthdayRemainder.css';
import UserApiServices from '../../../services/user_api_services/UserApiServices';
import Carousel from 'react-bootstrap/Carousel';
import Image from 'react-bootstrap/Image';
import birthday from '../../../assets/images/birthday.jpg';
import anniversaries from '../../../assets/images/work-anniversaries.png';

const BirthdayRemainder = () => {
  const [birthdayEmployees, setBirthdayEmployees] = useState([]);
  const [anniversaryEmployees, setAnniversaryEmployees] = useState([]);
  const [error, setError] = useState(null);
  const [profilePics, setProfilePics] = useState({});

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const birthdayData = await UserApiServices.getEmployeesWithBirthdayToday();
        setBirthdayEmployees(birthdayData);

        const anniversaryData = await UserApiServices.getEmployeesWithAnniversaryToday();
        setAnniversaryEmployees(anniversaryData);

        const profilePicsPromises = [...birthdayData, ...anniversaryData].map(async (employee) => {
          try {
            const response = await UserApiServices.getProfilePicture(employee.employeeCode);
            const blob = await response.blob();
            return {
              code: employee.employeeCode,
              url: URL.createObjectURL(blob)
            };
          } catch (error) {
            console.error(`Error fetching profile picture for ${employee.name}:`, error);
            return {
              code: employee.employeeCode,
              url: birthday // Set default image on fetch error
            };
          }
        });

        const profilePicsArray = await Promise.all(profilePicsPromises);
        const profilePicsMap = profilePicsArray.reduce((acc, { code, url }) => {
          acc[code] = url;
          return acc;
        }, {});
        setProfilePics(profilePicsMap);

      } catch (error) {
        setError(`Error fetching employee data: ${error.message}`);
      }
    };

    fetchEmployeeData();
  }, []);

  return (
    <div className='birthday-container1'>
      <div id='birthday1' className='carousel-container1'>
        <h2>Birthdays Today</h2><br></br>
        {error && <p className="error1">{error}</p>}
        <Carousel data-bs-theme="white" className='carousel1'>
          {birthdayEmployees.map(employee => (
            <Carousel.Item key={employee.employeeId}>
              <div className="carousel-content1">
                <Image
                  src={profilePics[employee.employeeCode] || birthday}
                  alt={`${employee.firstName} ${employee.lastName}`}
                  className="profile-pic1"
                  onError={(e) => { e.target.src =birthday;}} // Fallback on error
                />
                <h3>{employee.firstName} {employee.lastName}</h3>
                <p>{employee.email}</p>
                <p>{"Wish him happy birthday since his birthday is today. Send him an email with the birthday wishes"}</p>
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      </div>
      <div id='anniversary1' className='carousel-container1'>
        <h2>Anniversaries Today</h2><br></br>
        {error && <p className="error1">{error}</p>}
        <Carousel data-bs-theme="white" className='carousel1'>
          {anniversaryEmployees.map(employee => (
            <Carousel.Item key={employee.employeeId}>
              <div className="carousel-content1">
                <Image
                  src={profilePics[employee.employeeCode] || anniversaries}
                  alt={`${employee.firstName} ${employee.lastName}`}
                  className="profile-pic1"
                  onError={(e) => { e.target.src = birthday; }} // Fallback on error
                />
                <h3>{employee.firstName} {employee.lastName}</h3>
                <p>{employee.email}</p>
                <p>{"Congratulate him on his anniversary since his anniversary is today. Send him an email with the anniversary wishes."}</p>
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      </div>
    </div>
  );
};

export default BirthdayRemainder;
