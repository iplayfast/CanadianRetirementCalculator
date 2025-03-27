






**rules**
__INTEREST_RULES__ Interest is always calculated at the end of the year, so 100 invested in year 1 at 10% will be worth 110 at the start of year 2.

__EXPENSE_RULES__ Expenses are always deducted at the beginning of a year. So any investment won't show interest on money that should have gone to expenses.

__RSP_Rules__
If the person is working and has an income and is under 71 year old, and if there is extra income over the expenses, and there is room in the rsp the money should go into the rsp up to the room amount, and that value should also be taken off the income.This will affect the room in subsequent years of the rsp until the time when the rsp is started to be withdrawn from. Use the rrsp_reasearch.md to find out the limits.  The goal is to reduce income while working so that it can be withdrawn later in life at a lower tax rate.

__TFSA_Rules__
If the person has more income then expenses, and there is room in their tfsa, then that income should go into their tfsa up to the room. The goal is to increase savings in a tax free manner.  The __RSP_Rules__ take precedence over the __TFSA_Rules__

__Other_Investments__
If the the person has more income then expenses, then that income should be put into other Investments. The __TFSA_Rules__ take precedence over the __Other_Investments__ rules.

__Optimizations__
Optimizations are done to test varous scenarios. Maximizing Capital at the end of the series, Minimizing Tax paid for example. 
Optimizations are done using a brute force method of filtering in the following way.

for SpouseAge 
   for PersonAge
        calculate the minimum income needed in order to meet the expenses
        if there is extra income apply the __Other_Investments__, __TFSA_Rules__, and __RSP_RULES__ to this extra income (assumption is that the person is still working or doing well in their investments)
        If there is not extra income to meet the expenses
            needed = expenses - income 
            for r in value needed  to rsp available step 1000 
                for t = value needed to tfsa available step 1000
                    withdraw r from rsp, and t from tfsa, 
for each of these for loops at the end of the age, we track which do the best at minimal tax and maximum capital, for balanced we track for minimal tax and maximum capital.

**enhancements** 
It would be nice to create web based spreadsheet in the reports that can be modified to overwrite any of the values calculated, and do the recalulation from that age on. So if for instance a special vacation is wanted at age 70, the expense for that year can be put up. The following years expense would remain the same, but the caluclation for the rsp tfsa and other investments would be updated.

