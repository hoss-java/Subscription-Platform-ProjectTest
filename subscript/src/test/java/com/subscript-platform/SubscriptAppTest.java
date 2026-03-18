package com.subscript;

import junit.framework.Test;
import junit.framework.TestCase;
import junit.framework.TestSuite;

/**
 * Unit test for simple App.
 */
public class SubscriptAppTest 
    extends TestCase
{
    /**
     * Create the test case
     *
     * @param testName name of the test case
     */
    public SubscriptAppTest( String testName )
    {
        super( testName );
    }

    /**
     * @return the suite of tests being tested
     */
    public static Test suite()
    {
        return new TestSuite( SubscriptAppTest.class );
    }

    /**
     * Rigourous Test :-)
     */
    public void testSubscriptApp()
    {
        assertTrue( true );
    }
}
