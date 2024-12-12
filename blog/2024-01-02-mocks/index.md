# Mocking data

We are mainly working with objects and when mocking data we are concerned with 2 aspects: **shape** and **concrete values**.

When writing tests, the focus is generally concentrated around a small subset of the data which is directly manipulated or observed, the rest is either mocked or ignored completely.  
There is a large amount of this _auxiliary_ data that is needed for a test: a brand being set up, agent, feature flags, tasks etc.

In other words: the shape of the data prevents the application from crashing while the concrete values help us define the business logic.

<!--truncate-->
