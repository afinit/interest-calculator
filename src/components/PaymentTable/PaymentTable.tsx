import React from 'react';

import { LoanState } from '../../containers/Calculator/Calculator';

interface PaymentTableProps {
    loans: Array<LoanState>;
}

interface LoanTrack {
    principal: number;
    interestRate: number;
    loanLength: number;
    loanMonthlyPayment: number;
    interestPayment: number;
    principalPayment: number;
    totalPayment: number;
    [key: string]: number;
}

const calculateLoanState = (loan: LoanTrack) => {
    if (loan.principal > 0) {
        loan.interestPayment = loan.interestRate * loan.principal / 12.0;
        const payment = loan.loanMonthlyPayment - loan.interestPayment;
        loan.principalPayment = (loan.principal - payment) > 0.005 ? payment : loan.principal;
        loan.principal -= loan.principalPayment;
        loan.totalPayment = loan.principalPayment + loan.interestPayment;
        console.log("interest: ", loan.interestPayment, " principal: ", loan.principal, " principalPayment: ", loan.principalPayment, " payment: ", payment);
    }
    else {
        loan.interestPayment = 0;
        loan.principalPayment = 0;
        loan.totalPayment = 0;
    }
    return { ...loan };
}

const paymentTable = (props: PaymentTableProps) => {
    const loansCopy: Array<LoanState> = JSON.parse(JSON.stringify(props.loans));
    const loans = loansCopy.map((loan: LoanState) => {
        return { ...loan, interestPayment: 0, principalPayment: 0, totalPayment: 0 }
    });
    // const interestRates = props.loans.map(loan => loan.interestRate);
    // const loanIdxSorted = interestRates.map((rate, idx) => [rate, idx])
    //     .sort((a,b) => a[0] - b[0])
    //     .map(x => x[1]);

    var monthlyUpdates = [];

    // var totalPrincipal = loans.map(loan => loan.principal).reduce((acc, elem) => acc + elem);
    const longestLoan = Math.max(...loans.map(loan => loan.loanLength))
    console.log("longestLoan: ", longestLoan);

    for (var i = 0; i < longestLoan; i++) {
        monthlyUpdates.push(loans.map(calculateLoanState));
        // totalPrincipal = loans.map(loan => loan.principal).reduce((acc, elem) => acc + elem);
    }

    console.log(monthlyUpdates);
    return (
        <div>
            <p>Total Loan Cost: {
                monthlyUpdates.flatMap(month => month.map(loan => loan.totalPayment))
                    .reduce((a,b) => a + b).toFixed(2)
            }</p>
            <table>
                <thead>
                    <tr>
                        <th>Month</th>
                        <th>Principal</th>
                        <th>Interest Payment</th>
                        <th>Principal Payment</th>
                        <th>Total Payment</th>
                    </tr>
                </thead>
                <tbody>
                    {monthlyUpdates.map((month, idx) =>
                        <tr key={idx}>
                            <td>{idx}</td>
                            <td>{month.map(loan => loan.principal).reduce((a, b) => a + b).toFixed(2)}</td>
                            <td>{month.map(loan => loan.interestPayment).reduce((a, b) => a + b).toFixed(2)}</td>
                            <td>{month.map(loan => loan.principalPayment).reduce((a, b) => a + b).toFixed(2)}</td>
                            <td>{month.map(loan => loan.totalPayment).reduce((a, b) => a + b).toFixed(2)}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default paymentTable;