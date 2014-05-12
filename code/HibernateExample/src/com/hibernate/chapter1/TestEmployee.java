package com.hibernate.chapter1;

import java.sql.Date;
import java.util.GregorianCalendar;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.cfg.AnnotationConfiguration;
import org.hibernate.tool.hbm2ddl.SchemaExport;

public class TestEmployee {

	public static void main(String[] args) {
		AnnotationConfiguration config = new AnnotationConfiguration();
		config.addAnnotatedClass(Employee.class);
		config.configure("hibernate.cfg.xml");

		// new SchemaExport(config).create(true, true);

		SessionFactory factory = config.buildSessionFactory();
		Session session = factory.getCurrentSession();

		session.beginTransaction();

		// transient object
		{
			Employee alex = new Employee();
			// alex.setEmpId(100);
			alex.setEmpName("alex Berry");
			alex.setEmpEmailAddress("alex@hibernate.com");
			alex.setEmpPassword("alexpass");
			alex.setPermanent(true);
			alex.setEmpJoinDate(new GregorianCalendar(2009, 05, 26));
			alex.setEmpLoginTime(Date.valueOf("2010-06-05"));

			session.save(alex);
		}

		{
			Employee sara = new Employee();
			// sara.setEmpId(100);
			sara.setEmpName("sara Berry");
			sara.setEmpEmailAddress("sara@hibernate.com");
			sara.setEmpPassword("sarapass");
			sara.setPermanent(true);
			sara.setEmpJoinDate(new GregorianCalendar(2009, 05, 26));
			sara.setEmpLoginTime(Date.valueOf("2010-06-05"));

			session.save(sara);
		}

		{
			Employee john = new Employee();
			// john.setEmpId(100);
			john.setEmpName("john Berry");
			john.setEmpEmailAddress("john@hibernate.com");
			john.setEmpPassword("johnpass");
			john.setPermanent(true);
			john.setEmpJoinDate(new GregorianCalendar(2009, 05, 26));
			john.setEmpLoginTime(Date.valueOf("2010-06-05"));

			session.save(john);
		}

		{
			Employee orin = new Employee();
			// orin.setEmpId(100);
			orin.setEmpName("orin Berry");
			orin.setEmpEmailAddress("orin@hibernate.com");
			orin.setEmpPassword("orinpass");
			orin.setPermanent(true);
			orin.setEmpJoinDate(new GregorianCalendar(2009, 05, 26));
			orin.setEmpLoginTime(Date.valueOf("2010-06-05"));

			session.save(orin);
		}

		{
			Employee michele = new Employee();
			// michele.setEmpId(100);
			michele.setEmpName("michele Berry");
			michele.setEmpEmailAddress("michele@hibernate.com");
			michele.setEmpPassword("michelepass");
			michele.setPermanent(true);
			michele.setEmpJoinDate(new GregorianCalendar(2009, 05, 26));
			michele.setEmpLoginTime(Date.valueOf("2010-06-05"));

			session.save(michele);
		}
		// the actual commiting
		session.getTransaction().commit();

	}

}
